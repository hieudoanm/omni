use super::internal;
use anyhow::{anyhow, Result};
use clap::Args;
use serde_json::json;
use std::path::Path;

#[derive(Args)]
pub struct ReadArgs {
    /// File path
    #[arg(long, short = 'f', default_value = "")]
    pub file: String,
    /// Number of lines to show (0 = all)
    #[arg(long, short = 'n', default_value_t = 0)]
    pub lines: usize,
    /// Starting line offset (0-based)
    #[arg(long, short = 'o', default_value_t = 0)]
    pub offset: usize,
    /// Show line numbers
    #[arg(long, default_value_t = true, action = clap::ArgAction::Set)]
    pub numbers: bool,
}

pub fn run(args: &ReadArgs, json: bool) -> Result<()> {
    let path = &args.file;
    let info = std::fs::metadata(path)?;
    if info.is_dir() {
        return Err(anyhow!("{path:?} is a directory"));
    }
    let content = std::fs::read_to_string(path)?;
    let all_lines = internal::split_lines(&content);
    let total = all_lines.len();

    let start = args.offset.min(total);
    let end = if args.lines == 0 {
        total
    } else {
        (start + args.lines).min(total)
    };
    let display: Vec<String> = all_lines[start..end].to_vec();

    if json {
        let display_content = if args.offset > 0 || args.lines > 0 {
            internal::join_lines(&display)
        } else {
            content.clone()
        };
        println!(
            "{}",
            serde_json::to_string_pretty(&json!({
                "file": path,
                "size": info.len(),
                "mode": mode_string(&info),
                "mime": internal::detect_mime(path),
                "totalLines": total,
                "content": display_content,
            }))?
        );
        return Ok(());
    }

    let abs = std::fs::canonicalize(path).unwrap_or_else(|_| Path::new(path).to_path_buf());
    println!("── {} ──", abs.display());
    if display.is_empty() {
        println!("(empty file)");
        return Ok(());
    }
    let line_width = end.to_string().len();
    for (i, line) in display.iter().enumerate() {
        let num = start + i + 1;
        if args.numbers {
            println!("{:>width$} | {}", num, line, width = line_width);
        } else {
            println!("{line}");
        }
    }
    if start > 0 || end < total {
        println!("── {}/{total} lines ({}-{end}) ──", end - start, start + 1);
    }
    Ok(())
}

#[cfg(unix)]
fn mode_string(info: &std::fs::Metadata) -> String {
    use std::os::unix::fs::PermissionsExt;
    format!("{:04o}", info.permissions().mode() & 0o7777)
}

#[cfg(not(unix))]
fn mode_string(_info: &std::fs::Metadata) -> String {
    String::new()
}
