use super::internal;
use anyhow::Result;
use clap::Args;
use std::os::unix::fs::PermissionsExt;

#[derive(Args)]
pub struct ChmodArgs {
    /// Octal permission mode (e.g. 755)
    #[arg(long, short = 'm', default_value = "")]
    pub mode: String,
    /// File or directory path
    #[arg(long, short = 'f', default_value = "")]
    pub file: String,
    /// Change permissions recursively
    #[arg(long, short = 'r')]
    pub recursive: bool,
}

pub fn run(args: &ChmodArgs, json: bool) -> Result<()> {
    let mode = internal::parse_mode(&args.mode)?;

    if args.recursive {
        for entry in walk(&args.file) {
            std::fs::set_permissions(&entry, std::fs::Permissions::from_mode(mode))?;
        }
    } else {
        std::fs::set_permissions(&args.file, std::fs::Permissions::from_mode(mode))?;
    }

    if json {
        println!(
            "{}",
            serde_json::to_string_pretty(&serde_json::json!({
                "file": args.file,
                "mode": args.mode,
                "recursive": args.recursive,
            }))?
        );
    }
    Ok(())
}

fn walk(root: &str) -> Vec<std::path::PathBuf> {
    let mut out = Vec::new();
    let mut stack = vec![std::path::PathBuf::from(root)];
    while let Some(p) = stack.pop() {
        out.push(p.clone());
        if let Ok(rd) = std::fs::read_dir(&p) {
            for e in rd.flatten() {
                if e.file_type().map(|t| t.is_dir()).unwrap_or(false) {
                    stack.push(e.path());
                }
            }
        }
    }
    out
}
