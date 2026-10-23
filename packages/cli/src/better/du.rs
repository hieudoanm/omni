use super::{human_size, print_table};
use anyhow::Result;
use clap::Args;
use serde::Serialize;
use std::fs;
use std::path::{Path, PathBuf};

#[derive(Args)]
pub struct DuArgs {
    /// Root directory to analyse
    #[arg(long, short = 'd', default_value = ".")]
    pub dir: String,
    /// Max directory depth (0 = unlimited)
    #[arg(long, short = 'D', default_value_t = 1)]
    pub depth: i64,
    /// Sort column: size, name
    #[arg(long, short = 's', default_value = "size")]
    pub sort: String,
    /// Show files too, not just directories
    #[arg(long, short = 'a')]
    pub all: bool,
    /// Human-readable sizes
    #[arg(long, short = 'H')]
    pub human: bool,
    /// Minimum size in KB to show (0 = no filter)
    #[arg(long, short = 't', default_value_t = 0)]
    pub threshold: i64,
}

#[derive(Serialize, Clone)]
struct DuEntry {
    path: String,
    #[serde(rename = "size_bytes")]
    size: i64,
    #[serde(skip_serializing_if = "Option::is_none")]
    items: Option<i64>,
    is_dir: bool,
}

pub fn run(args: &DuArgs, json: bool) -> Result<()> {
    let abs_dir = match fs::canonicalize(&args.dir) {
        Ok(p) if fs::metadata(&p).map(|m| m.is_dir()).unwrap_or(false) => p,
        _ => return Err(anyhow::anyhow!("cannot access {:?}", args.dir)),
    };

    let max_depth = if args.depth <= 0 {
        i64::MAX
    } else {
        args.depth
    };
    let mut results: Vec<DuEntry> = Vec::new();
    let (total, items) = walk(&abs_dir, &abs_dir, 0, max_depth, args.all, &mut results);
    // Go emits the root entry only when it has subdirectories; mirror that.
    if items > 0 {
        results.push(DuEntry {
            path: ".".into(),
            size: total,
            items: Some(items),
            is_dir: true,
        });
    }

    results.sort_by(|a, b| {
        if args.sort == "name" {
            a.path.to_lowercase().cmp(&b.path.to_lowercase())
        } else {
            b.size.cmp(&a.size)
        }
    });

    if args.threshold > 0 {
        let threshold_bytes = args.threshold * 1024;
        results.retain(|r| r.size >= threshold_bytes);
    }

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

    let size_header = if args.human { "Size" } else { "Size (bytes)" };
    let mut rows = Vec::with_capacity(results.len());
    for r in &results {
        rows.push(vec![
            if r.is_dir { "d".into() } else { "-".into() },
            if args.human {
                human_size(r.size)
            } else {
                r.size.to_string()
            },
            r.path.clone(),
        ]);
    }
    print_table(&["Type", size_header, "Path"], &rows);
    Ok(())
}

/// Returns (recursive_size, item_count); appends entries for dirs within
/// `max_depth` and (when `all`) files at every visited level.
fn walk(
    root: &Path,
    dir: &Path,
    depth: i64,
    max_depth: i64,
    all: bool,
    results: &mut Vec<DuEntry>,
) -> (i64, i64) {
    let Ok(entries) = fs::read_dir(dir) else {
        return (0, 0);
    };
    let mut total = fs::metadata(dir).map(|m| m.len() as i64).unwrap_or(0);
    let mut items = 0i64;

    for e in entries.flatten() {
        if e.file_name().to_string_lossy().starts_with('.') {
            continue;
        }
        let Ok(fi) = e.metadata() else { continue };
        let path = e.path();
        if fi.is_dir() {
            let (sub_size, _) = walk(root, &path, depth + 1, max_depth, all, results);
            let size = sub_size + fi.len() as i64;
            if depth < max_depth {
                results.push(DuEntry {
                    path: rel_path(root, &path),
                    size,
                    items: Some(1),
                    is_dir: true,
                });
            }
            total += size;
            items += 1;
        } else {
            total += fi.len() as i64;
            items += 1;
            if all {
                results.push(DuEntry {
                    path: rel_path(root, &path),
                    size: fi.len() as i64,
                    items: Some(1),
                    is_dir: false,
                });
            }
        }
    }
    (total, items)
}

fn rel_path(root: &Path, path: &Path) -> String {
    let rel: PathBuf = path.strip_prefix(root).unwrap_or(path).to_path_buf();
    rel.to_string_lossy().replace('\\', "/")
}
