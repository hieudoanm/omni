use anyhow::Result;
use clap::Args;
use serde::Serialize;
use std::env;
use std::path::PathBuf;

#[derive(Args)]
pub struct PathArgs {
    /// Command name to resolve in PATH
    #[arg()]
    pub command: Option<String>,
    /// Sort alphabetically by path
    #[arg(long)]
    pub sort: bool,
}

#[derive(Serialize)]
struct Entry {
    index: usize,
    dir: String,
    exists: bool,
}

pub fn run(args: &PathArgs, json: bool) -> Result<()> {
    let path_env = env::var("PATH").unwrap_or_default();
    let dirs: Vec<PathBuf> = env::split_paths(&path_env).collect();

    if let Some(cmd) = &args.command {
        let full = look_path(cmd, &dirs)
            .ok_or_else(|| anyhow::anyhow!("command {cmd:?} not found in PATH"))?;
        if json {
            println!(
                "{}",
                serde_json::to_string_pretty(&serde_json::json!({
                    "command": cmd,
                    "path": full.display().to_string(),
                }))?
            );
        } else {
            println!("{}", full.display());
        }
        return Ok(());
    }

    let entries: Vec<Entry> = dirs
        .iter()
        .enumerate()
        .map(|(i, d)| Entry {
            index: i,
            dir: d.display().to_string(),
            exists: d.exists(),
        })
        .collect();
    let mut entries = entries;
    if args.sort {
        entries.sort_by(|a, b| a.dir.cmp(&b.dir));
    }

    if json {
        println!("{}", serde_json::to_string_pretty(&entries)?);
    } else {
        for e in &entries {
            let mark = if e.exists { " " } else { "✗" };
            println!(" {mark} {}", e.dir);
        }
    }
    Ok(())
}

/// Go `exec.LookPath`: first executable match in PATH order.
fn look_path(cmd: &str, dirs: &[PathBuf]) -> Option<PathBuf> {
    for dir in dirs {
        let p = dir.join(cmd);
        if is_executable(&p) {
            return Some(p);
        }
    }
    None
}

#[cfg(unix)]
fn is_executable(p: &std::path::Path) -> bool {
    use std::os::unix::fs::PermissionsExt;
    std::fs::metadata(p)
        .map(|m| m.is_file() && m.permissions().mode() & 0o111 != 0)
        .unwrap_or(false)
}

#[cfg(not(unix))]
fn is_executable(p: &std::path::Path) -> bool {
    p.is_file()
}
