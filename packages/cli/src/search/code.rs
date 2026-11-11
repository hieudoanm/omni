use anyhow::{anyhow, Result};
use clap::Args;
use regex::Regex;
use serde::Serialize;
use std::fs;
use std::path::Path;

#[derive(Args)]
pub struct CodeArgs {
    /// Symbol name to search (regex)
    #[arg(long, short = 's', default_value = "")]
    pub symbol: String,
    /// Root directory to search
    #[arg(long, short = 'd', default_value = ".")]
    pub dir: String,
    /// Language filter (go, ts, py, rs)
    #[arg(long, short = 'l', default_value = "")]
    pub lang: String,
    /// Symbol kind (function, type, variable, method, class)
    #[arg(long, short = 'k', default_value = "")]
    pub kind: String,
    /// Maximum number of results (0 = unlimited)
    #[arg(long, short = 'n', default_value_t = 0)]
    pub max_results: usize,
}

#[derive(Serialize)]
struct SymbolMatch {
    file: String,
    line: usize,
    symbol: String,
    kind: String,
    language: String,
}

struct CodePattern {
    re: Regex,
    name_idx: usize,
    kind: &'static str,
}

fn patterns_for(path: &Path, lang_filter: &str) -> Option<(&'static str, Vec<CodePattern>)> {
    let ext = path
        .extension()
        .map(|e| format!(".{}", e.to_string_lossy().to_lowercase()))
        .unwrap_or_default();
    let pats: Vec<(&str, &str)> = match ext.as_str() {
        ".go" => {
            if !lang_filter.is_empty() && lang_filter != "go" {
                return None;
            }
            vec![
                (r"^func\s+(\w+)\s*\(", "method"),
                (r"^func\s+(\w+)\s*\(", "function"),
                (r"^type\s+(\w+)\s", "type"),
                (r"^var\s+(\w+)", "variable"),
                (r"^const\s+(\w+)", "constant"),
            ]
        }
        ".ts" | ".tsx" | ".js" | ".jsx" => {
            if !lang_filter.is_empty() && lang_filter != "ts" && lang_filter != "js" {
                return None;
            }
            vec![
                (r"^(?:export\s+)?(?:async\s+)?function\s+(\w+)", "function"),
                (r"^(?:export\s+)?class\s+(\w+)", "class"),
                (r"^(?:export\s+)?interface\s+(\w+)", "interface"),
                (r"^(?:export\s+)?type\s+(\w+)", "type"),
                (r"^(?:export\s+)?const\s+(\w+)", "variable"),
                (r"^(?:export\s+)?enum\s+(\w+)", "enum"),
            ]
        }
        ".py" => {
            if !lang_filter.is_empty() && lang_filter != "py" {
                return None;
            }
            vec![
                (r"^(?:async\s+)?def\s+(\w+)", "function"),
                (r"^class\s+(\w+)", "class"),
                (r#"^(\w+)\s*=\s*(?:lambda|[{(['"0-9])"#, "variable"),
            ]
        }
        ".rs" => {
            if !lang_filter.is_empty() && lang_filter != "rs" {
                return None;
            }
            vec![
                (r"^(?:pub\s+)?fn\s+(\w+)", "function"),
                (r"^(?:pub\s+)?struct\s+(\w+)", "struct"),
                (r"^(?:pub\s+)?trait\s+(\w+)", "trait"),
                (r"^(?:pub\s+)?enum\s+(\w+)", "enum"),
                (r"^(?:pub\s+)?type\s+(\w+)", "type"),
                (r"^(?:pub\s+)?const\s+(\w+)", "constant"),
            ]
        }
        _ => return None,
    };
    let lang = match ext.as_str() {
        ".go" => "go",
        ".ts" | ".tsx" | ".js" | ".jsx" => "typescript",
        ".py" => "python",
        ".rs" => "rust",
        _ => unreachable!(),
    };
    Some((
        lang,
        pats.into_iter()
            .map(|(re, kind)| CodePattern {
                re: Regex::new(re).unwrap(),
                name_idx: 1,
                kind,
            })
            .collect(),
    ))
}

pub fn run(args: &CodeArgs, json: bool) -> Result<()> {
    let symbol_re = Regex::new(&args.symbol)
        .map_err(|e| anyhow!("invalid symbol pattern {:?}: {e}", args.symbol))?;

    let mut results: Vec<SymbolMatch> = Vec::new();
    let root = Path::new(&args.dir);

    let process_file = |path: &Path, results: &mut Vec<SymbolMatch>| -> bool {
        let Some((lang_name, patterns)) = patterns_for(path, &args.lang) else {
            return true;
        };
        if !args.kind.is_empty() && !patterns.iter().any(|p| p.kind == args.kind) {
            return true;
        }
        let Ok(data) = fs::read(path) else {
            return true;
        };
        if data.contains(&0) {
            return true;
        }
        let text = String::from_utf8_lossy(&data);
        for (i, line) in text.lines().enumerate() {
            let trimmed = line.trim();
            for p in &patterns {
                let Some(caps) = p.re.captures(trimmed) else {
                    continue;
                };
                let Some(name) = caps.get(p.name_idx) else {
                    continue;
                };
                let name = name.as_str();
                if !symbol_re.is_match(name) {
                    continue;
                }
                if !args.kind.is_empty() && p.kind != args.kind {
                    continue;
                }
                results.push(SymbolMatch {
                    file: path.to_string_lossy().to_string(),
                    line: i + 1,
                    symbol: name.to_string(),
                    kind: p.kind.to_string(),
                    language: lang_name.to_string(),
                });
                if args.max_results > 0 && results.len() >= args.max_results {
                    return false;
                }
            }
        }
        true
    };

    let info = fs::metadata(root).map_err(|e| anyhow!("{e}"))?;
    if info.is_dir() {
        walk_code(root, &mut |path: &Path| {
            if !process_file(path, &mut results) {
                return false;
            }
            !(args.max_results > 0 && results.len() >= args.max_results)
        });
    } else {
        process_file(root, &mut results);
    }

    if json {
        println!(
            "{}",
            serde_json::to_string_pretty(&serde_json::json!({
                "symbol": args.symbol,
                "results": results,
                "count": results.len(),
            }))?
        );
        return Ok(());
    }
    if results.is_empty() {
        println!("(no symbols found)");
        return Ok(());
    }
    for r in &results {
        println!("{}:{}: {} {}", r.file, r.line, r.kind, r.symbol);
    }
    println!("\n{} symbols found", results.len());
    Ok(())
}

fn walk_code<F: FnMut(&Path) -> bool>(dir: &Path, f: &mut F) {
    let entries = match fs::read_dir(dir) {
        Ok(e) => e,
        Err(e) => {
            eprintln!("error accessing {}: {e}", dir.display());
            return;
        }
    };
    for e in entries.flatten() {
        let path = e.path();
        let Ok(fi) = e.metadata() else {
            eprintln!("error accessing {}", path.display());
            continue;
        };
        if fi.is_dir() {
            walk_code(&path, f);
        } else if !f(&path) {
            return;
        }
    }
}
