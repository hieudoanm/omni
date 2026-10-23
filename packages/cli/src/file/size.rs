use super::internal;
use anyhow::Result;
use clap::Args;
use std::path::Path;

#[derive(Args)]
pub struct SizeArgs {
    /// File or directory path
    #[arg(long, short = 'p', default_value = "")]
    pub path: String,
}

pub fn run(args: &SizeArgs, json: bool) -> Result<()> {
    let info = std::fs::metadata(&args.path)?;
    let size: i64 = if info.is_dir() {
        walk_files(&args.path)
            .iter()
            .filter_map(|p| std::fs::metadata(p).ok())
            .filter(|m| m.is_file())
            .map(|m| m.len() as i64)
            .sum()
    } else {
        info.len() as i64
    };

    if json {
        println!(
            "{}",
            serde_json::to_string_pretty(&serde_json::json!({"path": args.path, "size": size}))?
        );
    } else {
        println!("{}  {}", internal::format_size(size), args.path);
    }
    Ok(())
}

fn walk_files(root: &str) -> Vec<std::path::PathBuf> {
    let mut out = Vec::new();
    let mut stack = vec![Path::new(root).to_path_buf()];
    while let Some(p) = stack.pop() {
        if let Ok(rd) = std::fs::read_dir(&p) {
            for e in rd.flatten() {
                let path = e.path();
                if e.file_type().map(|t| t.is_dir()).unwrap_or(false) {
                    stack.push(path);
                } else {
                    out.push(path);
                }
            }
        }
    }
    out
}
