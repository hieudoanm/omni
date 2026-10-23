use super::internal;
use anyhow::{anyhow, Result};
use clap::Args;
use regex::Regex;
use serde::Serialize;
use std::path::Path;

#[derive(Args)]
pub struct GrepArgs {
    /// Regex or fixed string pattern to search for
    #[arg(long, short = 'p', default_value = "")]
    pub pattern: String,
    /// File or directory to search (default: .)
    #[arg(long, short = 'P', default_value = "")]
    pub path: String,
    /// Glob pattern for file names (e.g. "*.go")
    #[arg(long, short = 'i', default_value = "")]
    pub include: String,
    /// Show N lines of context around matches
    #[arg(long, short = 'C', default_value_t = 0)]
    pub context: usize,
    /// Fixed string match (not regex)
    #[arg(long, short = 'F')]
    pub fixed: bool,
    /// Maximum number of matches
    #[arg(long, short = 'm', default_value_t = 0)]
    pub max_count: usize,
    /// Case-insensitive search
    #[arg(long, short = 'v')]
    pub ignore_case: bool,
    /// Positional search paths (used when --path is empty)
    #[arg()]
    pub paths: Vec<String>,
}

#[derive(Serialize)]
struct LineMatch {
    #[serde(skip_serializing_if = "String::is_empty")]
    file: String,
    line: usize,
    content: String,
    #[serde(skip_serializing_if = "String::is_empty")]
    before: String,
    #[serde(skip_serializing_if = "String::is_empty")]
    after: String,
}

fn compile_search_pattern(pattern: &str, fixed: bool, ignore_case: bool) -> Result<Regex> {
    let pat = if fixed {
        regex::escape(pattern)
    } else if ignore_case {
        format!("(?i){pattern}")
    } else {
        pattern.to_string()
    };
    Regex::new(&pat).map_err(|e| anyhow!("invalid regex {pattern:?}: {e}"))
}

fn glob_to_regex(pattern: &str) -> String {
    // Go: QuoteMeta then \* -> .*, \? -> ., anchored.
    let mut out = String::from("^");
    for c in pattern.chars() {
        match c {
            '*' => out.push_str(".*"),
            '?' => out.push('.'),
            c => out.push_str(&regex::escape(&c.to_string())),
        }
    }
    out.push('$');
    out
}

fn binary_extensions() -> &'static [&'static str] {
    &[
        ".exe", ".bin", ".o", ".a", ".so", ".dll", ".dylib", ".jpg", ".jpeg", ".png", ".gif",
        ".ico", ".pdf", ".zip", ".tar", ".gz", ".bz2", ".7z", ".mp3", ".mp4", ".mov", ".avi",
        ".webp", ".woff", ".woff2",
    ]
}

fn is_binary(path: &Path) -> bool {
    let ext = path
        .extension()
        .map(|e| format!(".{}", e.to_string_lossy().to_lowercase()))
        .unwrap_or_default();
    if binary_extensions().contains(&ext.as_str()) {
        return true;
    }
    let Ok(data) = std::fs::read(path) else {
        return false;
    };
    data.iter().take(512).any(|&b| b == 0)
}

fn search_file(re: &Regex, path: &str, context: usize, max_count: usize) -> Vec<LineMatch> {
    let Ok(data) = std::fs::read(path) else {
        return Vec::new();
    };
    let lines = internal::split_lines(&String::from_utf8_lossy(&data));
    let mut matches = Vec::new();
    for (i, line) in lines.iter().enumerate() {
        if re.is_match(line) {
            let mut m = LineMatch {
                file: String::new(),
                line: i + 1,
                content: line.clone(),
                before: String::new(),
                after: String::new(),
            };
            if context > 0 {
                let start = i.saturating_sub(context);
                let end = (i + context + 1).min(lines.len());
                let ctx: Vec<String> = (start..end)
                    .map(|j| {
                        let mark = if j == i { '>' } else { ' ' };
                        format!("{mark}{:>5}| {}", j + 1, lines[j])
                    })
                    .collect();
                let match_idx = i - start;
                m.before = ctx[..match_idx].join("\n");
                m.after = ctx[match_idx + 1..].join("\n");
            }
            matches.push(m);
            if max_count > 0 && matches.len() >= max_count {
                break;
            }
        }
    }
    matches
}

fn walk_files(root: &Path) -> Vec<std::path::PathBuf> {
    let mut out = Vec::new();
    let mut stack = vec![root.to_path_buf()];
    while let Some(p) = stack.pop() {
        match std::fs::read_dir(&p) {
            Ok(rd) => {
                for e in rd.flatten() {
                    let path = e.path();
                    match e.file_type() {
                        Ok(t) if t.is_dir() => stack.push(path),
                        Ok(_) => out.push(path),
                        Err(err) => eprintln!("error accessing {}: {err}", path.display()),
                    }
                }
            }
            Err(err) => eprintln!("error accessing {}: {err}", p.display()),
        }
    }
    out
}

pub fn run(args: &GrepArgs, json: bool) -> Result<()> {
    let search_paths: Vec<String> = if !args.path.is_empty() {
        vec![args.path.clone()]
    } else if !args.paths.is_empty() {
        args.paths.clone()
    } else {
        vec![".".to_string()]
    };

    let re = compile_search_pattern(&args.pattern, args.fixed, args.ignore_case)?;
    let include_re = if args.include.is_empty() {
        None
    } else {
        Regex::new(&glob_to_regex(&args.include)).ok()
    };

    let mut matches: Vec<LineMatch> = Vec::new();
    let mut total_files = 0usize;

    for root in &search_paths {
        let path = Path::new(root);
        let Ok(info) = std::fs::metadata(path) else {
            eprintln!("error: {}", std::fs::metadata(path).unwrap_err());
            continue;
        };
        if !info.is_dir() {
            let mut fm = search_file(&re, root, args.context, args.max_count);
            for m in &mut fm {
                m.file = root.clone();
            }
            total_files += 1;
            matches.extend(fm);
            continue;
        }
        for f in walk_files(path) {
            if let Some(inc) = &include_re {
                let name = f
                    .file_name()
                    .map(|n| n.to_string_lossy().to_string())
                    .unwrap_or_default();
                if !inc.is_match(&name) {
                    continue;
                }
            }
            if is_binary(&f) {
                continue;
            }
            let fstr = f.to_string_lossy().to_string();
            let mut fm = search_file(&re, &fstr, args.context, args.max_count);
            for m in &mut fm {
                m.file = fstr.clone();
            }
            total_files += 1;
            matches.extend(fm);
            if args.max_count > 0 && matches.len() >= args.max_count {
                break;
            }
        }
        if args.max_count > 0 && matches.len() >= args.max_count {
            break;
        }
    }

    if json {
        println!(
            "{}",
            serde_json::to_string_pretty(&serde_json::json!({
                "pattern": args.pattern,
                "files": total_files,
                "matches": matches.len(),
                "results": matches,
            }))?
        );
        return Ok(());
    }

    if matches.is_empty() {
        println!("(no matches)");
        return Ok(());
    }

    let multi_file = total_files > 1;
    for m in &matches {
        let prefix = if multi_file {
            format!("{}:", m.file)
        } else {
            String::new()
        };
        if !m.before.is_empty() {
            for l in m.before.lines() {
                println!("{prefix}  {l}");
            }
        }
        println!("{prefix}{}: {}", m.line, m.content);
        if !m.after.is_empty() {
            for l in m.after.lines() {
                println!("{prefix}  {l}");
            }
        }
    }
    Ok(())
}
