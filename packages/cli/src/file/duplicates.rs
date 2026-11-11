use super::internal;
use anyhow::Result;
use clap::Args;
use serde_json::json;
use std::collections::BTreeMap;
use std::path::Path;

#[derive(Args)]
pub struct DuplicatesArgs {
    /// Directory to scan
    #[arg(long, short = 'd', default_value = "")]
    pub dir: String,
    /// Minimum file size to consider (bytes)
    #[arg(long, short = 'm', default_value_t = 1)]
    pub min_size: i64,
}

pub fn run(args: &DuplicatesArgs, json: bool) -> Result<()> {
    let mut by_size: BTreeMap<i64, Vec<String>> = BTreeMap::new();
    for entry in walk_files(&args.dir) {
        let Ok(meta) = std::fs::metadata(&entry) else {
            continue;
        };
        if !meta.is_file() || meta.len() < args.min_size as u64 {
            continue;
        }
        by_size
            .entry(meta.len() as i64)
            .or_default()
            .push(entry.to_string_lossy().to_string());
    }

    // Go sorts sizes descending.
    let mut sizes: Vec<i64> = by_size.keys().copied().collect();
    sizes.sort_by(|a, b| b.cmp(a));

    let mut dup_groups: Vec<serde_json::Value> = Vec::new();
    let mut found_any = false;

    for size in sizes {
        let paths = &by_size[&size];
        if paths.len() < 2 {
            continue;
        }
        let mut by_hash: BTreeMap<String, Vec<String>> = BTreeMap::new();
        for p in paths {
            if let Ok(h) = internal::quick_hash(p) {
                by_hash.entry(h).or_default().push(p.clone());
            }
        }
        for dups in by_hash.values() {
            if dups.len() < 2 {
                continue;
            }
            found_any = true;
            if json {
                dup_groups.push(json!({"size": size, "files": dups}));
            } else {
                println!("Duplicates ({} each):", internal::format_size(size));
                for d in dups {
                    println!("  {d}");
                }
                println!();
            }
        }
    }

    if json {
        println!("{}", serde_json::to_string_pretty(&dup_groups)?);
    } else if !found_any {
        println!("No duplicates found.");
    }
    Ok(())
}

fn walk_files(root: &str) -> Vec<std::path::PathBuf> {
    let mut out = Vec::new();
    let mut stack = vec![Path::new(root).to_path_buf()];
    while let Some(p) = stack.pop() {
        match std::fs::read_dir(&p) {
            Ok(rd) => {
                for e in rd.flatten() {
                    let path = e.path();
                    if e.file_type().map(|t| t.is_dir()).unwrap_or(false) {
                        stack.push(path);
                    } else {
                        out.push(path);
                    }
                }
            }
            Err(e) => eprintln!("error accessing {}: {e}", p.display()),
        }
    }
    out
}
