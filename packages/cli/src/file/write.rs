use super::internal;
use anyhow::{anyhow, Result};
use clap::Args;
use std::io::Read;
use std::io::Write;
use std::path::Path;

#[derive(Args)]
pub struct WriteArgs {
    /// File path
    #[arg(long, short = 'f', default_value = "")]
    pub file: String,
    /// File content (omit to read from stdin)
    #[arg(long, short = 'c', default_value = "")]
    pub content: String,
    /// Append to file instead of overwriting
    #[arg(long, short = 'a')]
    pub append: bool,
    /// Create parent directories if needed
    #[arg(long, short = 'p')]
    pub mkdir: bool,
    /// File permissions (octal, e.g. 644)
    #[arg(long, short = 'm', default_value = "")]
    pub mode: String,
}

pub fn run(args: &WriteArgs, json: bool) -> Result<()> {
    let content = if !args.content.is_empty() {
        args.content.clone()
    } else {
        read_stdin()?
    };

    if args.mkdir {
        if let Some(dir) = Path::new(&args.file).parent() {
            if dir != Path::new("") {
                std::fs::create_dir_all(dir)?;
            }
        }
    }

    let mut perm_mode = 0o644u32;
    if !args.mode.is_empty() {
        perm_mode = internal::parse_mode(&args.mode)?;
    }

    let n = if args.append {
        let mut f = std::fs::OpenOptions::new()
            .create(true)
            .append(true)
            .open(&args.file)?;
        f.write_all(content.as_bytes())?;
        content.len()
    } else {
        std::fs::write(&args.file, content.as_bytes())?;
        content.len()
    };
    #[cfg(unix)]
    {
        use std::os::unix::fs::PermissionsExt;
        std::fs::set_permissions(&args.file, std::fs::Permissions::from_mode(perm_mode))?;
    }

    if json {
        println!(
            "{}",
            serde_json::to_string_pretty(&serde_json::json!({
                "file": args.file,
                "bytes": n,
                "append": args.append,
            }))?
        );
    } else {
        let verb = if args.append { "Appended" } else { "Written" };
        println!("{verb} {n} bytes to {}", args.file);
    }
    Ok(())
}

fn read_stdin() -> Result<String> {
    // Go errors when stdin is a TTY; approximate by reading whatever is piped.
    let mut buf = String::new();
    std::io::stdin()
        .read_to_string(&mut buf)
        .map_err(|e| anyhow!("stdin: {e}"))?;
    if buf.is_empty() {
        return Err(anyhow!(
            "no content provided (pipe content or pass as argument)"
        ));
    }
    Ok(buf.trim_end_matches('\n').to_string())
}
