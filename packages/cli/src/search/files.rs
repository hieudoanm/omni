use anyhow::{anyhow, Result};
use clap::Args;
use serde_json::json;
use std::fs;
use std::path::{Path, PathBuf};

#[derive(Args)]
pub struct FilesArgs {
    /// Glob pattern to match
    #[arg(long, short = 'p', default_value = "")]
    pub pattern: String,
    /// Root directory to search
    #[arg(long, short = 'd', default_value = ".")]
    pub dir: String,
    /// Maximum directory depth (0 = unlimited)
    #[arg(long, short = 'D', default_value_t = 0)]
    pub max_depth: i64,
    /// Filter by type: f (file) or d (directory)
    #[arg(long, short = 't', default_value = "")]
    pub file_type: String,
    /// Include hidden files and directories
    #[arg(long, short = 'H')]
    pub hidden: bool,
}

pub fn run(args: &FilesArgs, json: bool) -> Result<()> {
    let results = find_files(
        &args.pattern,
        &args.dir,
        args.max_depth,
        &args.file_type,
        args.hidden,
    )?;

    if json {
        println!(
            "{}",
            serde_json::to_string_pretty(&json!({
                "pattern": args.pattern,
                "root": args.dir,
                "files": results,
                "count": results.len(),
            }))?
        );
        return Ok(());
    }
    if results.is_empty() {
        println!("(no files found)");
        return Ok(());
    }
    let abs_root = fs::canonicalize(&args.dir).unwrap_or_else(|_| PathBuf::from(&args.dir));
    for f in &results {
        let rel = Path::new(f)
            .strip_prefix(&abs_root)
            .map(|p| p.to_string_lossy().to_string())
            .unwrap_or_else(|_| f.clone());
        println!("{rel}");
    }
    if results.len() > 1 {
        println!("\n{} files found", results.len());
    }
    Ok(())
}

fn find_files(
    pattern: &str,
    root: &str,
    max_depth: i64,
    file_type: &str,
    hidden: bool,
) -> Result<Vec<String>> {
    let info = fs::metadata(root).map_err(|e| anyhow!("{e}"))?;
    if !info.is_dir() {
        return Err(anyhow!("{root:?} is not a directory"));
    }
    // Validate pattern (Go: filepath.Match(pattern, ""))
    glob_match_path(pattern, "").map_err(|_| anyhow!("invalid pattern {pattern:?}"))?;

    validate_glob(pattern).map_err(|_| anyhow!("invalid pattern {pattern:?}"))?;

    let abs_root = fs::canonicalize(root).unwrap_or_else(|_| PathBuf::from(root));
    let has_glob_star = pattern.contains("**");
    let mut results: Vec<String> = Vec::new();

    // filepath.Walk visits the root itself first.
    {
        let root_is_dir = info.is_dir();
        let root_name = abs_root
            .file_name()
            .map(|n| n.to_string_lossy().to_string())
            .unwrap_or_default();
        visit_entry(
            &abs_root,
            root_is_dir,
            &root_name,
            pattern,
            has_glob_star,
            file_type,
            hidden,
            &mut results,
        );
    }

    walk(&abs_root, 0, max_depth, &mut |path, is_dir, name| {
        if !hidden && is_dir && is_hidden(path) {
            return WalkControl::SkipDir;
        }
        visit_entry(
            path,
            is_dir,
            name,
            pattern,
            has_glob_star,
            file_type,
            hidden,
            &mut results,
        );
        WalkControl::Continue
    })?;
    results.sort();
    Ok(results)
}

#[allow(clippy::too_many_arguments)]
fn visit_entry(
    path: &Path,
    is_dir: bool,
    name: &str,
    pattern: &str,
    has_glob_star: bool,
    file_type: &str,
    hidden: bool,
    results: &mut Vec<String>,
) {
    if !hidden && is_hidden(path) {
        return;
    }
    if file_type == "d" && !is_dir {
        return;
    }
    if file_type == "f" && is_dir {
        return;
    }
    if has_glob_star {
        if glob_match_path(pattern, &path.to_string_lossy()).unwrap_or(false) {
            results.push(path.to_string_lossy().to_string());
        }
        return;
    }
    if is_dir {
        return;
    }
    if glob_match_segment(pattern, name).unwrap_or(false) {
        results.push(path.to_string_lossy().to_string());
    }
}

/// Syntax-check every pattern segment like filepath.Match does for the whole pattern.
fn validate_glob(pattern: &str) -> Result<(), ()> {
    for seg in pattern.split('/') {
        let chars: Vec<char> = seg.chars().collect();
        let mut i = 0;
        while i < chars.len() {
            match chars[i] {
                '\\' => {
                    i += 2;
                    continue;
                }
                '[' => {
                    i += 1;
                    if i < chars.len() && (chars[i] == '!' || chars[i] == '^') {
                        i += 1;
                    }
                    if i < chars.len() && chars[i] == ']' {
                        i += 1;
                    }
                    let mut closed = false;
                    while i < chars.len() {
                        if chars[i] == ']' {
                            closed = true;
                            i += 1;
                            break;
                        }
                        i += 1;
                    }
                    if !closed {
                        return Err(());
                    }
                    continue;
                }
                _ => i += 1,
            }
        }
    }
    Ok(())
}

enum WalkControl {
    Continue,
    SkipDir,
}

fn walk<F: FnMut(&Path, bool, &str) -> WalkControl>(
    dir: &Path,
    depth: i64,
    max_depth: i64,
    f: &mut F,
) -> Result<()> {
    let entries = match fs::read_dir(dir) {
        Ok(e) => e,
        Err(e) => {
            eprintln!("error accessing {}: {e}", dir.display());
            return Ok(());
        }
    };
    for e in entries.flatten() {
        let path = e.path();
        let Ok(fi) = e.metadata() else {
            eprintln!("error accessing {}", path.display());
            continue;
        };
        let is_dir = fi.is_dir();
        let name = e.file_name().to_string_lossy().to_string();
        match f(&path, is_dir, &name) {
            WalkControl::SkipDir => continue,
            WalkControl::Continue => {}
        }
        if is_dir && (max_depth <= 0 || depth + 1 < max_depth) {
            walk(&path, depth + 1, max_depth, f)?;
        }
    }
    Ok(())
}

fn is_hidden(path: &Path) -> bool {
    path.components().any(|c| {
        c.as_os_str().to_string_lossy().starts_with('.')
            && c.as_os_str() != "."
            && c.as_os_str() != ".."
    })
}

/// Glob match within one path segment (no `/` crossing) — Go `filepath.Match`
/// semantics for `*`, `?`, `[...]`, `\` escapes.
fn glob_match_segment(pat: &str, name: &str) -> Result<bool, ()> {
    let p: Vec<char> = pat.chars().collect();
    let n: Vec<char> = name.chars().collect();
    match_here(&p, &n)
}

/// Path-aware glob: pattern and path split on '/', matched segment-wise.
/// `*`/`?`/`[]` never cross a separator (Go filepath.Match behavior).
fn glob_match_path(pat: &str, path: &str) -> Result<bool, ()> {
    let ps: Vec<&str> = pat.split('/').collect();
    let ns: Vec<&str> = path.split('/').collect();
    match_segments(&ps, &ns)
}

fn match_segments(p: &[&str], n: &[&str]) -> Result<bool, ()> {
    if p.is_empty() {
        return Ok(n.is_empty());
    }
    if n.is_empty() {
        return Ok(false);
    }
    // A pattern segment may itself contain no '/', so recurse pairwise.
    if glob_match_segment(p[0], n[0])? {
        return match_segments(&p[1..], &n[1..]);
    }
    Ok(false)
}

fn match_here(p: &[char], n: &[char]) -> Result<bool, ()> {
    if p.is_empty() {
        return Ok(n.is_empty());
    }
    match p[0] {
        '*' => {
            let mut i = 0;
            while i < p.len() && p[i] == '*' {
                i += 1;
            }
            for skip in 0..=n.len() {
                if match_here(&p[i..], &n[skip..])? {
                    return Ok(true);
                }
            }
            Ok(false)
        }
        '?' => {
            if n.is_empty() {
                Ok(false)
            } else {
                match_here(&p[1..], &n[1..])
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
                return Err(());
            }
            if matched == negate {
                return Ok(false);
            }
            match_here(&p[i + 1..], &n[1..])
        }
        '\\' if p.len() > 1 => {
            if n.is_empty() || n[0] != p[1] {
                Ok(false)
            } else {
                match_here(&p[2..], &n[1..])
            }
        }
        c => {
            if n.is_empty() || n[0] != c {
                Ok(false)
            } else {
                match_here(&p[1..], &n[1..])
            }
        }
    }
}
