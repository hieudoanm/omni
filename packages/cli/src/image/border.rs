use super::internal;
use anyhow::Result;
use clap::Args;
use image::{imageops::overlay, Rgba, RgbaImage};

#[derive(Args)]
pub struct BorderArgs {
    /// Input image file
    pub file: String,
    /// Border width in pixels
    #[arg(long, short = 'w', default_value_t = 10)]
    pub width: u32,
    /// Border color (name or #hex)
    #[arg(long, short = 'c', default_value = "black")]
    pub color: String,
    /// Output file path
    #[arg(long, short = 'o', default_value = "")]
    pub output: String,
}

#[derive(serde::Serialize)]
struct BorderResult {
    status: &'static str,
    input: String,
    output: String,
    width: i32,
    color: String,
}

pub fn run(args: &BorderArgs, json: bool) -> Result<()> {
    let src = internal::open_image(&args.file)?;
    let (w, h) = src.dimensions();
    let bw = args.width as i64;
    let mut dst = RgbaImage::from_pixel(
        w + 2 * args.width,
        h + 2 * args.width,
        Rgba(internal::parse_color(&args.color, [0, 0, 0, 255])),
    );
    overlay(&mut dst, &src, bw, bw);
    let out_path = if args.output.is_empty() {
        internal::default_output(&args.file, "_bordered")
    } else {
        args.output.clone()
    };
    internal::save_image(&dst, &out_path)?;
    if json {
        println!(
            "{}",
            serde_json::to_string(&BorderResult {
                status: "ok",
                input: args.file.clone(),
                output: out_path,
                width: args.width as i32,
                color: args.color.clone(),
            })?
        );
    } else {
        println!("{out_path}");
    }
    Ok(())
}
