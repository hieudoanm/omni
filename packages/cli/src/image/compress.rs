use super::internal;
use anyhow::{anyhow, Result};
use clap::Args;

#[derive(Args)]
pub struct CompressArgs {
    /// Input image file
    pub file: String,
    /// Output quality (1-100)
    #[arg(long, short = 'q', default_value_t = 80)]
    pub quality: u8,
    /// Output format (jpg, png, gif)
    #[arg(long, short = 'f', default_value = "")]
    pub format: String,
    /// Output file path
    #[arg(long, short = 'o', default_value = "")]
    pub output: String,
}

#[derive(serde::Serialize)]
struct CompressResult {
    status: &'static str,
    input: String,
    output: String,
    format: String,
    quality: u8,
}

pub fn run(args: &CompressArgs, json: bool) -> Result<()> {
    let img = internal::open_image(&args.file)?;
    let out_path = if args.output.is_empty() {
        internal::default_output(&args.file, "_compressed")
    } else {
        args.output.clone()
    };
    let out_fmt = if args.format.is_empty() {
        std::path::Path::new(&args.file)
            .extension()
            .and_then(|s| s.to_str())
            .unwrap_or("")
            .to_lowercase()
    } else {
        args.format.to_lowercase()
    };
    let f = std::fs::File::create(&out_path)?;
    let mut w = std::io::BufWriter::new(f);
    let (w_px, h_px) = img.dimensions();
    let raw = img.as_raw();
    match out_fmt.as_str() {
        "jpg" | "jpeg" => {
            let rgb = image::DynamicImage::ImageRgba8(img.clone()).to_rgb8();
            image::ImageEncoder::write_image(
                image::codecs::jpeg::JpegEncoder::new_with_quality(&mut w, args.quality),
                rgb.as_raw(),
                w_px,
                h_px,
                image::ExtendedColorType::Rgb8,
            )
        }
        .map_err(|e| anyhow!("encode: {e}"))?,
        "png" => image::ImageEncoder::write_image(
            image::codecs::png::PngEncoder::new(&mut w),
            raw,
            w_px,
            h_px,
            image::ExtendedColorType::Rgba8,
        )
        .map_err(|e| anyhow!("encode: {e}"))?,
        _ => return Err(anyhow!("unsupported format: {out_fmt}")),
    }
    if json {
        println!(
            "{}",
            serde_json::to_string(&CompressResult {
                status: "ok",
                input: args.file.clone(),
                output: out_path,
                format: out_fmt,
                quality: args.quality,
            })?
        );
    } else {
        println!("{out_path}");
    }
    Ok(())
}
