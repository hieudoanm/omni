use super::internal;
use anyhow::Result;
use clap::Args;
use serde::Serialize;
use std::collections::BTreeMap;
use std::path::Path;

#[derive(Args)]
pub struct StatsArgs {
    /// Directory path
    #[arg(long, short = 'd', default_value = "")]
    pub dir: String,
}

#[derive(Serialize)]
struct ExtEntry {
    extension: String,
    files: usize,
    size: i64,
}

pub fn run(args: &StatsArgs, json: bool) -> Result<()> {
    let mut ext_stats: BTreeMap<String, (usize, i64)> = BTreeMap::new();
    let mut total_files = 0usize;
    let mut total_size = 0i64;

    for path in walk_files(&args.dir) {
        let Ok(meta) = std::fs::metadata(&path) else {
            eprintln!("error accessing {}", path.display());
            continue;
        };
        if !meta.is_file() {
            continue;
        }
        total_files += 1;
        total_size += meta.len() as i64;
        let ext = std::path::Path::new(&path)
            .extension()
            .map(|e| format!(".{}", e.to_string_lossy().to_lowercase()))
            .unwrap_or_else(|| "(no extension)".to_string());
        let e = ext_stats.entry(ext).or_default();
        e.0 += 1;
        e.1 += meta.len() as i64;
    }

    let mut entries: Vec<(String, usize, i64)> =
        ext_stats.into_iter().map(|(k, v)| (k, v.0, v.1)).collect();
    entries.sort_by_key(|e| std::cmp::Reverse(e.2));

    if json {
        let entries_json: Vec<ExtEntry> = entries
            .iter()
            .map(|(ext, files, size)| ExtEntry {
                extension: ext.clone(),
                files: *files,
                size: *size,
            })
            .collect();
        println!(
            "{}",
            serde_json::to_string_pretty(&serde_json::json!({
                "path": args.dir,
                "totalFiles": total_files,
                "totalSize": total_size,
                "byExtension": entries_json,
            }))?
        );
        return Ok(());
    }

    println!("Total files : {total_files}");
    println!("Total size  : {}", internal::format_size(total_size));
    println!();
    println!("{:<20} {:>8} {:>12}", "Extension", "Files", "Size");
    println!("{}", "-".repeat(42));
    for (ext, files, size) in &entries {
        println!(
            "{:<20} {:>8} {:>12}",
            ext,
            files,
            internal::format_size(*size)
        );
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
