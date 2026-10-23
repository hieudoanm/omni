use anyhow::{anyhow, Result};
use clap::Args;
use std::path::Path;
use std::process::Command;

#[derive(Args)]
pub struct EbookArgs {
    /// E-book file to convert
    #[arg()]
    pub file: String,
    /// Output format (epub, mobi, azw3)
    #[arg(long, default_value = "epub")]
    pub format: String,
    /// Output file path
    #[arg(long, short = 'o', default_value = "")]
    pub output: String,
}

pub fn run(args: &EbookArgs) -> Result<()> {
    // Go: exec.LookPath("ebook-convert")
    let path = std::env::var("PATH").unwrap_or_default();
    let found = std::env::split_paths(&path)
        .map(|d| d.join("ebook-convert"))
        .find(|p| p.is_file());
    let prog = found.ok_or_else(|| anyhow!("ebook-convert not found in PATH (install calibre)"))?;

    let output = if args.output.is_empty() {
        let p = Path::new(&args.file);
        let ext = p
            .extension()
            .map(|e| e.to_string_lossy().to_string())
            .unwrap_or_default();
        let base = p
            .file_stem()
            .map(|s| s.to_string_lossy().to_string())
            .unwrap_or_default();
        format!("{base}.{ext}.{fmt}", fmt = args.format)
    } else {
        args.output.clone()
    };

    let status = Command::new(prog)
        .arg(&args.file)
        .arg(&output)
        .status()
        .map_err(|e| anyhow!("ebook-convert failed: {e}"))?;
    if !status.success() {
        return Err(anyhow!("ebook-convert failed"));
    }
    println!("Created: {output}");
    Ok(())
}
