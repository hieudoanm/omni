use anyhow::{bail, Result};
use clap::Args;
use std::path::Path;
use std::process::Command;

#[derive(Args)]
pub struct OcrArgs {
    /// PDF file
    pub file: String,
    /// OCR language (e.g. eng, vie, fra)
    #[arg(long, short = 'l', default_value = "eng")]
    pub language: String,
    /// Output file (default: stdout)
    #[arg(long, short = 'o', default_value = "")]
    pub output: String,
}

pub fn run(args: &OcrArgs) -> Result<()> {
    if Command::new("tesseract").arg("--version").output().is_err() {
        bail!("tesseract not found: install it first (brew install tesseract / apt install tesseract-ocr)");
    }
    let dir = Path::new(&args.file)
        .parent()
        .map(|p| p.to_path_buf())
        .unwrap_or_else(|| Path::new(".").to_path_buf());
    let tmp = dir.join("_ocr_tmp_");
    let status = Command::new("tesseract")
        .arg(&args.file)
        .arg(tmp.to_string_lossy().to_string())
        .args(["-l", &args.language, "--psm", "3"])
        .status()?;
    if !status.success() {
        bail!("tesseract failed");
    }
    let txt = tmp.with_extension("txt");
    let data = std::fs::read_to_string(&txt)
        .map_err(|e| anyhow::anyhow!("cannot read OCR output: {}", e))?;
    let _ = std::fs::remove_file(&txt);
    if !args.output.is_empty() {
        std::fs::write(&args.output, &data)?;
        println!("OCR output written to {}", args.output);
    } else {
        print!("{}", data);
    }
    Ok(())
}
