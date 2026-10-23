use anyhow::{anyhow, Result};
use clap::Args;
use serde::Serialize;

#[derive(Args)]
pub struct InfoArgs {
    /// Input image file
    pub file: String,
}

#[derive(Serialize)]
struct Info {
    format: String,
    width: u32,
    height: u32,
    size_bytes: u64,
}

pub fn run(args: &InfoArgs, _json: bool) -> Result<()> {
    let bytes = std::fs::read(&args.file).map_err(|e| anyhow!("open: {e}"))?;
    let format = image::guess_format(&bytes)
        .ok()
        .map(|f| format!("{f:?}").to_uppercase())
        .unwrap_or_else(|| "UNKNOWN".to_string());
    let img = super::internal::open_dynamic(&args.file)
        .map_err(|_| anyhow!("decode: unsupported or invalid image"))?;
    let size = std::fs::metadata(&args.file)
        .map_err(|e| anyhow!("stat: {e}"))?
        .len();
    println!(
        "{}",
        serde_json::to_string(&Info {
            format,
            width: img.width(),
            height: img.height(),
            size_bytes: size,
        })?
    );
    Ok(())
}
