use anyhow::{anyhow, Result};
use clap::Args;
use regex::Regex;
use serde::Serialize;
use std::collections::HashSet;
use std::fs;
use std::path::Path;

#[derive(Args)]
pub struct TextArgs {
    /// Regex pattern to search
    #[arg(long, short = 'p', default_value = "")]
    pub pattern: String,
    /// File or directory to search
    #[arg(long, short = 'P', default_value = ".")]
    pub path: String,
    /// Case-insensitive search
    #[arg(long, short = 'i')]
    pub ignore_case: bool,
    /// Maximum number of matches
    #[arg(long, short = 'm', default_value_t = 0)]
    pub max_count: usize,
    /// Glob pattern for file names (e.g. "*.go")
    #[arg(long, default_value = "")]
    pub include: String,
    /// Maximum directory depth (0 = unlimited)
    #[arg(long, short = 'd', default_value_t = 0)]
    pub max_depth: usize,
}

#[derive(Serialize)]
struct TextMatch {
    file: String,
    line: usize,
    content: String,
}

pub fn run(args: &TextArgs, json: bool) -> Result<()> {
    let re_pattern = if args.ignore_case {
        format!("(?i){}", args.pattern)
    } else {
        args.pattern.clone()
    };
    let re =
        Regex::new(&re_pattern).map_err(|e| anyhow!("invalid regex {:?}: {e}", args.pattern))?;
    let include_re = include_to_regex(&args.include);

    let results = search_text(
        &args.path,
        &re,
        include_re.as_ref(),
        args.max_depth,
        args.max_count,
    )?;

    if json {
        println!(
            "{}",
            serde_json::to_string_pretty(&serde_json::json!({
                "pattern": args.pattern,
                "matches": results.len(),
                "results": results,
            }))?
        );
        return Ok(());
    }
    if results.is_empty() {
        println!("(no matches)");
        return Ok(());
    }
    for m in &results {
        println!("{}:{}: {}", m.file, m.line, m.content);
    }
    if results.len() > 1 {
        println!("\n{} matches", results.len());
    }
    Ok(())
}

fn include_to_regex(include: &str) -> Option<Regex> {
    if include.is_empty() {
        return None;
    }
    // Go: QuoteMeta(include), then replace `\*` with `.*`, anchored.
    let mut out = String::from("^");
    let chars = include.chars();
    for c in chars {
        if c == '*' {
            out.push_str(".*");
        } else {
            out.push_str(&regex::escape(&c.to_string()));
        }
    }
    out.push('$');
    Regex::new(&out).ok()
}

fn search_text(
    root: &str,
    re: &Regex,
    include: Option<&Regex>,
    max_depth: usize,
    max_count: usize,
) -> Result<Vec<TextMatch>> {
    let mut results = Vec::new();
    let mut seen: HashSet<(String, usize)> = HashSet::new();

    let info = match fs::metadata(root) {
        Ok(i) => i,
        Err(e) => {
            eprintln!("error: {e}");
            return Ok(results);
        }
    };
    if !info.is_dir() {
        for m in search_file_text(root, re, max_count) {
            if seen.insert((m.file.clone(), m.line)) {
                results.push(m);
            }
        }
        return Ok(results);
    }

    walk_text(root, 0, max_depth, &mut |path, is_dir| {
        if is_dir {
            return true;
        }
        if let Some(inc) = include {
            let name = path
                .file_name()
                .map(|n| n.to_string_lossy().to_string())
                .unwrap_or_default();
            if !inc.is_match(&name) {
                return true;
            }
        }
        for m in search_file_text(path.to_str().unwrap_or(""), re, max_count) {
            if seen.insert((m.file.clone(), m.line)) {
                results.push(m);
            }
            if max_count > 0 && results.len() >= max_count {
                return false;
            }
        }
        true
    });
    Ok(results)
}

fn walk_text<F: FnMut(&Path, bool) -> bool>(
    root: &str,
    depth: usize,
    max_depth: usize,
    f: &mut F,
) -> bool {
    if max_depth > 0 && depth >= max_depth {
        return true;
    }
    let entries = match fs::read_dir(root) {
        Ok(e) => e,
        Err(e) => {
            eprintln!("error accessing {root}: {e}");
            return true;
        }
    };
    for e in entries.flatten() {
        let path = e.path();
        let Ok(fi) = e.metadata() else {
            eprintln!("error accessing {}", path.display());
            continue;
        };
        let is_dir = fi.is_dir();
        if !f(&path, is_dir) {
            return false;
        }
        if is_dir && !walk_text(path.to_str().unwrap_or(""), depth + 1, max_depth, f) {
            return false;
        }
    }
    true
}

fn search_file_text(path: &str, re: &Regex, max_count: usize) -> Vec<TextMatch> {
    let data = match fs::read(path) {
        Ok(d) => d,
        Err(_) => return Vec::new(),
    };
    if data.contains(&0) {
        return Vec::new();
    }
    let text = String::from_utf8_lossy(&data);
    let mut matches = Vec::new();
    for (i, line) in text.split('\n').enumerate() {
        if re.is_match(line) {
            matches.push(TextMatch {
                file: path.to_string(),
                line: i + 1,
                content: line.to_string(),
            });
            if max_count > 0 && matches.len() >= max_count {
                break;
            }
        }
    }
    matches
}
