use super::{human_size, print_table};
use anyhow::Result;
use chrono::{DateTime, Local};
use clap::Args;
use serde::Serialize;
use std::fs;

#[derive(Args)]
pub struct LsArgs {
    /// Directory to list
    #[arg(long, default_value = ".")]
    pub dir: String,
    /// Include hidden files
    #[arg(long, short = 'a')]
    pub all: bool,
    /// Long format with details
    #[arg(long, short = 'l')]
    pub long: bool,
    /// Human-readable sizes
    #[arg(long, short = 'H')]
    pub human: bool,
    /// Reverse sort order
    #[arg(long, short = 'r')]
    pub reverse: bool,
    /// Sort by modification time
    #[arg(long, short = 't')]
    pub time: bool,
    /// Sort by file size
    #[arg(long, short = 'S')]
    pub size: bool,
}

#[derive(Serialize)]
struct Entry {
    name: String,
    size: i64,
    mode: String,
    mod_time: String,
    is_dir: bool,
}

pub fn run(args: &LsArgs, json: bool) -> Result<()> {
    let abs_dir = fs::canonicalize(&args.dir)
        .map_err(|_| anyhow::anyhow!("cannot resolve path: {}", args.dir))?;
    let meta =
        fs::metadata(&abs_dir).map_err(|e| anyhow::anyhow!("cannot access {:?}: {e}", args.dir))?;
    if !meta.is_dir() {
        return Err(anyhow::anyhow!("{:?} is not a directory", args.dir));
    }

    let mut results: Vec<Entry> = Vec::new();
    for rd in fs::read_dir(&abs_dir).map_err(|e| anyhow::anyhow!("cannot read directory: {e}"))? {
        let Ok(rd) = rd else { continue };
        let name = rd.file_name().to_string_lossy().to_string();
        if !args.all && name.starts_with('.') {
            continue;
        }
        let Ok(fi) = rd.metadata() else { continue };
        let mtime = fi
            .modified()
            .ok()
            .map(|t| {
                let dt: DateTime<Local> = t.into();
                dt.format("%b %e %H:%M").to_string()
            })
            .unwrap_or_default();
        results.push(Entry {
            name,
            size: fi.len() as i64,
            mode: go_mode_string(&fi),
            mod_time: mtime,
            is_dir: fi.is_dir(),
        });
    }

    sort_entries(&mut results, args.time, args.size, args.reverse);

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

/// Go `fi.Mode().String()[1:]` — rwx string without the type char.
pub(crate) fn go_mode_string(meta: &fs::Metadata) -> String {
    #[cfg(unix)]
    {
        use std::os::unix::fs::PermissionsExt;
        let mode = meta.permissions().mode();
        let mut out = String::with_capacity(9);
        for shift in [6u32, 3, 0] {
            let bits = (mode >> shift) & 0o7;
            out.push(if bits & 4 != 0 { 'r' } else { '-' });
            out.push(if bits & 2 != 0 { 'w' } else { '-' });
            out.push(if bits & 1 != 0 { 'x' } else { '-' });
        }
        // setuid/setgid/sticky override the x positions, as in Go's Mode.String()
        if mode & 0o4000 != 0 {
            out.replace_range(2..3, if mode & 0o100 != 0 { "s" } else { "S" });
        }
        if mode & 0o2000 != 0 {
            out.replace_range(5..6, if mode & 0o010 != 0 { "s" } else { "S" });
        }
        if mode & 0o1000 != 0 {
            out.replace_range(8..9, if mode & 0o001 != 0 { "t" } else { "T" });
        }
        out
    }
    #[cfg(not(unix))]
    {
        let _ = meta;
        "---------".to_string()
    }
}

fn sort_entries(entries: &mut [Entry], by_time: bool, by_size: bool, reverse: bool) {
    entries.sort_by(|a, b| {
        let ord = if by_time {
            // Go compares formatted "Jan _2 15:04" strings descending
            b.mod_time.cmp(&a.mod_time)
        } else if by_size {
            b.size.cmp(&a.size)
        } else {
            a.name.to_lowercase().cmp(&b.name.to_lowercase())
        };
        if reverse {
            ord.reverse()
        } else {
            ord
        }
    });
}

fn output_long(results: &[Entry], human: bool) -> Result<()> {
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

fn output_short(results: &[Entry]) {
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
