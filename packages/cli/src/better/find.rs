use super::{human_size, print_table};
use anyhow::Result;
use clap::Args;
use serde::Serialize;
use std::fs;
use std::path::Path;

#[derive(Args)]
pub struct FindArgs {
    /// Root directory to search
    #[arg(long, short = 'd', default_value = ".")]
    pub dir: String,
    /// Glob pattern to match (e.g. *.go)
    #[arg(long, short = 'p', default_value = "")]
    pub pattern: String,
    /// Filter by name substring
    #[arg(long, short = 'n', default_value = "")]
    pub name: String,
    /// Filter by type: f (file) or d (directory)
    #[arg(long, short = 't', default_value = "")]
    pub file_type: String,
    /// Maximum recursion depth (0 = unlimited)
    #[arg(long, short = 'D', default_value_t = 0)]
    pub max_depth: i64,
    /// Include hidden files and directories
    #[arg(long, short = 'a')]
    pub all: bool,
    /// Long format with details
    #[arg(long, short = 'l')]
    pub long: bool,
    /// Human-readable sizes (requires --long)
    #[arg(long, short = 'H')]
    pub human: bool,
}

#[derive(Serialize)]
struct FindEntry {
    name: String,
    size: i64,
    mode: String,
    mod_time: String,
    is_dir: bool,
}

pub fn run(args: &FindArgs, json: bool) -> Result<()> {
    let abs_dir = fs::canonicalize(&args.dir)
        .map_err(|_| anyhow::anyhow!("cannot resolve path: {}", args.dir))?;
    let meta =
        fs::metadata(&abs_dir).map_err(|e| anyhow::anyhow!("cannot access {:?}: {e}", args.dir))?;
    if !meta.is_dir() {
        return Err(anyhow::anyhow!("{:?} is not a directory", args.dir));
    }
    if !args.pattern.is_empty() && glob_match(&args.pattern, "").is_err() {
        return Err(anyhow::anyhow!("invalid pattern {:?}", args.pattern));
    }

    let mut results: Vec<FindEntry> = Vec::new();
    walk(&abs_dir, &abs_dir, 0, args, &mut results);
    results.sort_by_key(|e| e.name.to_lowercase());

    if json {
        println!(
            "{}",
            serde_json::to_string_pretty(&serde_json::json!({
                "directory": abs_dir.display().to_string(),
                "entries": results,
                "count": results.len(),
            }))?
        );
        return Ok(());
    }
    if args.long {
        return output_long(&results, args.human);
    }
    output_short(&results);
    Ok(())
}

#[allow(clippy::too_many_arguments)]
fn walk(root: &Path, dir: &Path, depth: i64, args: &FindArgs, results: &mut Vec<FindEntry>) {
    if args.max_depth > 0 && depth >= args.max_depth {
        return;
    }
    let Ok(rd) = fs::read_dir(dir) else {
        eprintln!("error reading {}", dir.display());
        return;
    };
    for entry in rd.flatten() {
        let path = entry.path();
        let Ok(fi) = entry.metadata() else {
            eprintln!("error accessing {}", path.display());
            continue;
        };
        let rel = path
            .strip_prefix(root)
            .unwrap_or(&path)
            .to_string_lossy()
            .replace('\\', "/");
        if !args.all && is_hidden_path(&rel) {
            if fi.is_dir() {
                continue; // Go: SkipDir — handled by not recursing below
            }
            continue;
        }
        if args.file_type == "d" && !fi.is_dir() {
            continue;
        }
        if args.file_type == "f" && fi.is_dir() {
            continue;
        }
        let fname = entry.file_name().to_string_lossy().to_string();
        if !args.pattern.is_empty() && !glob_match(&args.pattern, &fname).unwrap_or(false) {
            if fi.is_dir() {
                walk(root, &path, depth + 1, args, results);
            }
            continue;
        }
        let name_ok =
            args.name.is_empty() || fname.to_lowercase().contains(&args.name.to_lowercase());
        if name_ok {
            let mtime = fi
                .modified()
                .ok()
                .map(|t| {
                    let dt: chrono::DateTime<chrono::Local> = t.into();
                    dt.format("%b %e %H:%M").to_string()
                })
                .unwrap_or_default();
            results.push(FindEntry {
                name: rel,
                size: fi.len() as i64,
                mode: super::ls::go_mode_string(&fi),
                mod_time: mtime,
                is_dir: fi.is_dir(),
            });
        }
        if fi.is_dir() {
            walk(root, &path, depth + 1, args, results);
        }
    }
}

fn is_hidden_path(rel: &str) -> bool {
    rel.split(['/', '\\'])
        .any(|p| !p.is_empty() && p.starts_with('.'))
}

fn output_long(results: &[FindEntry], human: bool) -> Result<()> {
    let size_header = if human { "Size" } else { "Size (bytes)" };
    let mut rows = Vec::with_capacity(results.len());
    for e in results {
        rows.push(vec![
            if e.is_dir { "d".into() } else { "-".into() },
            e.mode.clone(),
            if human {
                human_size(e.size)
            } else {
                e.size.to_string()
            },
            e.mod_time.clone(),
            e.name.clone(),
        ]);
    }
    print_table(&["Type", "Mode", size_header, "Modified", "Name"], &rows);
    Ok(())
}

fn output_short(results: &[FindEntry]) {
    let rows: Vec<Vec<String>> = results
        .iter()
        .map(|e| {
            vec![if e.is_dir {
                format!("{}/", e.name)
            } else {
                e.name.clone()
            }]
        })
        .collect();
    print_table(&["Name"], &rows);
}

/// Minimal glob matcher for `*`, `?`, `[...]` (Go filepath.Match on names —
/// no separator handling needed since it matches a single path element).
fn glob_match(pattern: &str, name: &str) -> Result<bool, ()> {
    let p: Vec<char> = pattern.chars().collect();
    let n: Vec<char> = name.chars().collect();
    match_glob(&p, &n)
}

fn match_glob(p: &[char], n: &[char]) -> Result<bool, ()> {
    if p.is_empty() {
        return Ok(n.is_empty());
    }
    match p[0] {
        '*' => {
            // collapse consecutive stars
            let mut i = 0;
            while i < p.len() && p[i] == '*' {
                i += 1;
            }
            for skip in 0..=n.len() {
                if match_glob(&p[i..], &n[skip..])? {
                    return Ok(true);
                }
            }
            Ok(false)
        }
        '?' => {
            if n.is_empty() {
                Ok(false)
            } else {
                match_glob(&p[1..], &n[1..])
            }
        }
        '[' => {
            if n.is_empty() {
                return Ok(false);
            }
            let mut i = 1;
            let negate = i < p.len() && (p[i] == '!' || p[i] == '^');
            if negate {
                i += 1;
            }
            let mut matched = false;
            let mut first = true;
            while i < p.len() && (p[i] != ']' || first) {
                first = false;
                if i + 2 < p.len() && p[i + 1] == '-' && p[i + 2] != ']' {
                    if n[0] >= p[i] && n[0] <= p[i + 2] {
                        matched = true;
                    }
                    i += 3;
                } else {
                    if n[0] == p[i] {
                        matched = true;
                    }
                    i += 1;
                }
            }
            if i >= p.len() {
                return Err(()); // unterminated class
            }
            if matched == negate {
                return Ok(false);
            }
            match_glob(&p[i + 1..], &n[1..])
        }
        '\\' if p.len() > 1 => {
            if n.is_empty() || n[0] != p[1] {
                Ok(false)
            } else {
                match_glob(&p[2..], &n[1..])
            }
        }
        c => {
            if n.is_empty() || n[0] != c {
                Ok(false)
            } else {
                match_glob(&p[1..], &n[1..])
            }
        }
    }
}
