use super::internal;
use anyhow::Result;
use clap::Args;
use image::imageops::FilterType;

#[derive(Args)]
pub struct IconsArgs {
    /// Input image file
    pub file: String,
    /// Icon sizes to generate
    #[arg(long, short = 's', value_delimiter = ',', default_values_t = [192, 512])]
    pub sizes: Vec<u32>,
}

pub fn run(args: &IconsArgs, _json: bool) -> Result<()> {
    let img = internal::open_dynamic(&args.file)?;
    let dir = std::path::Path::new(&args.file)
        .parent()
        .map(|p| p.display().to_string())
        .filter(|d| !d.is_empty())
        .unwrap_or_else(|| ".".to_string());
    let p = std::path::Path::new(&args.file);
    let stem = p.file_stem().and_then(|s| s.to_str()).unwrap_or("");
    for size in &args.sizes {
        let resized = img.resize_exact(*size, *size, FilterType::Triangle);
        let rgba = resized.to_rgba8();
        let out = format!("{dir}/{stem}-{size}.png");
        rgba.save(&out)?;
        println!("generated {out}");
    }
    Ok(())
}
