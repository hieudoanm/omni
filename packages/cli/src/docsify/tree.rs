use anyhow::{anyhow, Result};
use clap::Args;
use std::collections::HashSet;
use std::io::Write;
use std::path::{Path, PathBuf};

#[derive(Args)]
pub struct TreeArgs {
    /// Root directory to tree
    #[arg(long, default_value = ".")]
    pub dir: String,
    /// Output file path
    #[arg(long, default_value = "TREE.md")]
    pub out: String,
    /// Skip directories with this exact name (repeatable)
    #[arg(long = "ignore-dir")]
    pub ignore_dir: Vec<String>,
    /// Skip files with this exact name (repeatable)
    #[arg(long = "ignore-file")]
    pub ignore_file: Vec<String>,
}

#[derive(Clone)]
struct GitIgnoreRule {
    pattern: String,
    negate: bool,
    dir_only: bool,
}

struct GitIgnore {
    dir: PathBuf,
    rules: Vec<GitIgnoreRule>,
}

impl GitIgnore {
    fn ignore(&self, rel_path: &str, is_dir: bool) -> bool {
        let adjusted = rel_path.replace('\\', "/");
        let mut ignored = false;
        for r in &self.rules {
            if r.dir_only && !is_dir {
                continue;
            }
            let mut matched = glob_match(&r.pattern, &adjusted);
            if !matched {
                let base = adjusted.rsplit('/').next().unwrap_or(&adjusted);
                matched = glob_match(&r.pattern, base);
            }
            if !matched && !r.pattern.contains('/') {
                matched = adjusted.split('/').any(|seg| glob_match(&r.pattern, seg));
            }
            if matched {
                ignored = !r.negate;
            }
        }
        ignored
    }
}

/// filepath.Match equivalent for the subset used by .gitignore patterns.
fn glob_match(pattern: &str, text: &str) -> bool {
    let p: Vec<char> = pattern.chars().collect();
    let t: Vec<char> = text.chars().collect();
    glob_match_inner(&p, &t)
}

fn glob_match_inner(p: &[char], t: &[char]) -> bool {
    if p.is_empty() {
        return t.is_empty();
    }
    match p[0] {
        '*' => {
            // filepath.Match: '*' does not cross '/'
            let mut i = 0;
            loop {
                if glob_match_inner(&p[1..], &t[i..]) {
                    return true;
                }
                if i >= t.len() || t[i] == '/' {
                    return false;
                }
                i += 1;
            }
        }
        '?' => !t.is_empty() && t[0] != '/' && glob_match_inner(&p[1..], &t[1..]),
        '[' => {
            if t.is_empty() || t[0] == '/' {
                return false;
            }
            let mut i = 1;
            let neg = i < p.len() && (p[i] == '!' || p[i] == '^');
            if neg {
                i += 1;
            }
            let mut matched = false;
            let mut first = true;
            while i < p.len() && (p[i] != ']' || first) {
                first = false;
                if i + 2 < p.len() && p[i + 1] == '-' && p[i + 2] != ']' {
                    if t[0] >= p[i] && t[0] <= p[i + 2] {
                        matched = true;
                    }
                    i += 3;
                } else {
                    if p[i] == t[0] {
                        matched = true;
                    }
                    i += 1;
                }
            }
            if i >= p.len() {
                return false; // unterminated class
            }
            if matched == neg {
                return false;
            }
            glob_match_inner(&p[i + 1..], &t[1..])
        }
        '\\' if p.len() > 1 => !t.is_empty() && p[1] == t[0] && glob_match_inner(&p[2..], &t[1..]),
        c => !t.is_empty() && c == t[0] && glob_match_inner(&p[1..], &t[1..]),
    }
}

fn load_gitignore(dir: &Path) -> Result<Option<GitIgnore>> {
    let path = dir.join(".gitignore");
    let Ok(content) = std::fs::read_to_string(&path) else {
        return Ok(None);
    };
    let mut rules = Vec::new();
    for line in content.lines() {
        let mut line = line.trim().to_string();
        if line.is_empty() || line.starts_with('#') {
            continue;
        }
        let negate = line.starts_with('!');
        if negate {
            line = line[1..].to_string();
        }
        let dir_only = line.ends_with('/');
        if dir_only {
            line = line.trim_end_matches('/').to_string();
        }
        let line = line.trim_start_matches('/').to_string();
        rules.push(GitIgnoreRule {
            pattern: line,
            negate,
            dir_only,
        });
    }
    Ok(Some(GitIgnore {
        dir: dir.to_path_buf(),
        rules,
    }))
}

fn merge_ignores<'a>(
    parent: Option<&'a GitIgnore>,
    child: Option<&'a GitIgnore>,
) -> Option<GitIgnore> {
    match (parent, child) {
        (None, c) => c.map(|g| GitIgnore {
            dir: g.dir.clone(),
            rules: g.rules.clone(),
        }),
        (p, None) => p.map(|g| GitIgnore {
            dir: g.dir.clone(),
            rules: g.rules.clone(),
        }),
        (Some(p), Some(c)) => {
            let child_rel = pathdiff(&p.dir, &c.dir);
            let mut rules = p.rules.clone();
            for mut r in c.rules.clone() {
                if r.pattern.contains('/') && child_rel != "." {
                    r.pattern = format!("{child_rel}/{}", r.pattern);
                }
                rules.push(r);
            }
            Some(GitIgnore {
                dir: p.dir.clone(),
                rules,
            })
        }
    }
}

fn pathdiff(root: &Path, path: &Path) -> String {
    path.strip_prefix(root)
        .map(|r| {
            r.components()
                .map(|c| c.as_os_str().to_string_lossy())
                .collect::<Vec<_>>()
                .join("/")
        })
        .unwrap_or_else(|_| path.to_string_lossy().to_string())
}

pub fn run(args: &TreeArgs) -> Result<()> {
    let abs_dir =
        std::fs::canonicalize(&args.dir).map_err(|e| anyhow!("resolve directory: {e}"))?;
    let ignore = load_gitignore(&abs_dir).map_err(|e| anyhow!("load .gitignore: {e}"))?;

    let mut out = std::io::BufWriter::new(
        std::fs::File::create(&args.out).map_err(|e| anyhow!("create output: {e}"))?,
    );
    let ignore_dirs: HashSet<&str> = args.ignore_dir.iter().map(String::as_str).collect();
    let ignore_files: HashSet<&str> = args.ignore_file.iter().map(String::as_str).collect();

    writeln!(out, "# TREE")?;
    writeln!(out)?;
    writeln!(out, "```text")?;
    let (dirs, files) = write_tree(
        &mut out,
        &abs_dir,
        &abs_dir,
        "",
        ignore.as_ref(),
        &ignore_dirs,
        &ignore_files,
    )?;
    writeln!(out, "```")?;
    writeln!(out, "\n{dirs} directories, {files} files")?;
    Ok(())
}

fn write_tree<W: Write>(
    w: &mut W,
    root: &Path,
    dir: &Path,
    prefix: &str,
    ignore: Option<&GitIgnore>,
    ignore_dirs: &HashSet<&str>,
    ignore_files: &HashSet<&str>,
) -> Result<(usize, usize)> {
    let entries = std::fs::read_dir(dir).map_err(|e| anyhow!("{e}"))?;
    let mut dir_names = Vec::new();
    let mut file_names = Vec::new();
    for entry in entries.flatten() {
        let name = entry.file_name().to_string_lossy().to_string();
        if name.starts_with('.') {
            continue;
        }
        let is_dir = entry.path().is_dir();
        if is_dir && ignore_dirs.contains(name.as_str()) {
            continue;
        }
        if !is_dir && ignore_files.contains(name.as_str()) {
            continue;
        }
        let rel = pathdiff(root, &entry.path());
        if ignore.is_some_and(|gi| gi.ignore(&rel, is_dir)) {
            continue;
        }
        if is_dir {
            dir_names.push(name);
        } else {
            file_names.push(name);
        }
    }
    dir_names.sort();
    file_names.sort();

    let total_dirs = dir_names.len();
    let total_files = file_names.len();

    let ordered: Vec<(&String, bool)> = dir_names
        .iter()
        .map(|n| (n, true))
        .chain(file_names.iter().map(|n| (n, false)))
        .collect();

    let mut dirs_count = total_dirs;
    let mut files_count = total_files;

    for (i, (name, is_dir)) in ordered.iter().enumerate() {
        let is_last = i == ordered.len() - 1;
        let (connector, child_prefix) = if is_last {
            ("└── ", format!("{prefix}    "))
        } else {
            ("├── ", format!("{prefix}│   "))
        };
        if *is_dir {
            writeln!(w, "{prefix}{connector}{name}/")?;
            let sub_dir = dir.join(name);
            let sub_ignore = load_gitignore(&sub_dir)?;
            let merged = merge_ignores(ignore, sub_ignore.as_ref());
            let (sd, sf) = write_tree(
                w,
                root,
                &sub_dir,
                &child_prefix,
                merged.as_ref(),
                ignore_dirs,
                ignore_files,
            )?;
            dirs_count += sd;
            files_count += sf;
        } else {
            let rel = pathdiff(root, &dir.join(name));
            writeln!(w, "{prefix}{connector}[{name}](./{rel})")?;
        }
    }
    Ok((dirs_count, files_count))
}
