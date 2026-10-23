use anyhow::{anyhow, Result};
use clap::Args;

#[derive(Args)]
pub struct ConvertArgs {
    /// Input image file
    pub file: String,
    /// Output format (png, jpg, gif, webp)
    #[arg(long, short = 'f', default_value = "png")]
    pub format: String,
    /// Output file path
    #[arg(long, short = 'o', default_value = "")]
    pub output: String,
}

fn remove_ext(path: &str) -> String {
    let p = std::path::Path::new(path);
    match p.extension() {
        Some(_) => p.with_extension("").display().to_string(),
        None => path.to_string(),
    }
}

pub fn run(args: &ConvertArgs, _json: bool) -> Result<()> {
    let out_fmt = if args.format.is_empty() {
        "png".to_string()
    } else {
        args.format.clone()
    };
    let out_path = if args.output.is_empty() {
        format!("{}.{out_fmt}", remove_ext(&args.file))
    } else {
        args.output.clone()
    };
    let img = super::internal::open_image(&args.file)?;
    let f = std::fs::File::create(&out_path)?;
    let mut w = std::io::BufWriter::new(f);
    let (w_px, h_px) = img.dimensions();
    let raw = img.as_raw();
    let res = match out_fmt.to_lowercase().as_str() {
        "png" => image::ImageEncoder::write_image(
            image::codecs::png::PngEncoder::new(&mut w),
            raw,
            w_px,
            h_px,
            image::ExtendedColorType::Rgba8,
        ),
        "jpg" | "jpeg" => {
            let rgb = image::DynamicImage::ImageRgba8(img.clone()).to_rgb8();
            image::ImageEncoder::write_image(
                image::codecs::jpeg::JpegEncoder::new_with_quality(&mut w, 90),
                rgb.as_raw(),
                w_px,
                h_px,
                image::ExtendedColorType::Rgb8,
            )
        }
        "gif" => image::ImageEncoder::write_image(
            image::codecs::gif::GifEncoder::new(&mut w),
            raw,
            w_px,
            h_px,
            image::ExtendedColorType::Rgba8,
        ),
        _ => return Err(anyhow!("unsupported format: {}", args.format)),
    };
    res.map_err(|e| anyhow!("encode: {e}"))?;
    println!("converted {} -> {}", args.file, out_path);
    Ok(())
}
