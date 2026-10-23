use super::internal;
use anyhow::Result;
use clap::Args;
use image::{Rgba, RgbaImage};

#[derive(Args)]
pub struct RoundArgs {
    /// Input image file
    pub file: String,
    /// Corner radius (0 for circle)
    #[arg(long, short = 'r', default_value_t = 0)]
    pub radius: u32,
    /// Output file path
    #[arg(long, short = 'o', default_value = "")]
    pub output: String,
}

#[derive(serde::Serialize)]
struct RoundResult {
    status: &'static str,
    input: String,
    output: String,
    radius: u32,
}

pub fn run(args: &RoundArgs, json: bool) -> Result<()> {
    let src = internal::open_image(&args.file)?;
    let (w, h) = src.dimensions();
    let mut radius = args.radius;
    if radius == 0 {
        radius = (w.min(h)) / 2;
    }
    let r2 = (radius * radius) as i64;
    let cx = w as i64 / 2;
    let cy = h as i64 / 2;
    let mut dst = RgbaImage::new(w, h);
    for y in 0..h as i64 {
        for x in 0..w as i64 {
            let dx = x - cx;
            let dy = y - cy;
            if dx * dx + dy * dy <= r2 {
                dst.put_pixel(x as u32, y as u32, *src.get_pixel(x as u32, y as u32));
            }
        }
    }
    let _ = Rgba([0u8; 4]);
    let out_path = if args.output.is_empty() {
        let p = std::path::Path::new(&args.file);
        let stem = p.file_stem().and_then(|s| s.to_str()).unwrap_or("");
        format!("{}_rounded.png", p.with_file_name(stem).display())
    } else {
        args.output.clone()
    };
    internal::save_png(&dst, &out_path)?;
    if json {
        println!(
            "{}",
            serde_json::to_string(&RoundResult {
                status: "ok",
                input: args.file.clone(),
                output: out_path,
                radius,
            })?
        );
    } else {
        println!("{out_path}");
    }
    Ok(())
}
