use super::print_table;
use anyhow::Result;
use clap::Args;
use serde::Serialize;
use std::path::PathBuf;

#[derive(Args)]
pub struct WhichArgs {
    /// Commands to locate
    #[arg(required = true)]
    pub commands: Vec<String>,
    /// Show all matches in PATH, not just the first
    #[arg(long, short = 'a')]
    pub all: bool,
}

#[derive(Serialize)]
struct WhichEntry {
    name: String,
    path: String,
}

pub fn run(args: &WhichArgs, json: bool) -> Result<()> {
    let path_env = std::env::var("PATH").unwrap_or_default();
    let mut seen = std::collections::HashSet::new();
    let mut unique_dirs: Vec<PathBuf> = Vec::new();
    for d in std::env::split_paths(&path_env) {
        let abs = d.canonicalize().unwrap_or(d.clone());
        if seen.insert(abs.clone()) {
            unique_dirs.push(abs);
        }
    }

    let mut results: Vec<WhichEntry> = Vec::new();
    let mut seen_results = std::collections::HashSet::new();

    for name in &args.commands {
        let mut found = false;
        for dir in &unique_dirs {
            let full = dir.join(name);
            let Ok(meta) = std::fs::metadata(&full) else {
                continue;
            };
            #[cfg(unix)]
            {
                use std::os::unix::fs::PermissionsExt;
                if meta.permissions().mode() & 0o111 == 0 {
                    continue;
                }
            }
            let key = format!("{name}:{}", full.display());
            if !seen_results.insert(key) {
                continue;
            }
            results.push(WhichEntry {
                name: name.clone(),
                path: full.display().to_string(),
            });
            found = true;
            if !args.all {
                break;
            }
        }
        if !found && !args.all {
            results.push(WhichEntry {
                name: name.clone(),
                path: "not found".into(),
            });
        }
    }

    results.sort_by(|a, b| a.name.cmp(&b.name).then(a.path.cmp(&b.path)));

    if json {
        println!(
            "{}",
            serde_json::to_string_pretty(&serde_json::json!({
                "entries": results,
                "count": results.len(),
            }))?
        );
        return Ok(());
    }

    let rows: Vec<Vec<String>> = results
        .iter()
        .map(|e| vec![e.name.clone(), e.path.clone()])
        .collect();
    print_table(&["NAME", "PATH"], &rows);
    Ok(())
}
