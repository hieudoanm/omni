use super::internal;
use anyhow::Result;
use clap::Args;
use image::{imageops::overlay, RgbaImage};

#[derive(Args)]
pub struct CombineArgs {
    /// First image file
    pub file1: String,
    /// Second image file
    pub file2: String,
    /// Combine direction (horizontal, vertical)
    #[arg(long, short = 'd', default_value = "horizontal")]
    pub direction: String,
    /// Output file path
    #[arg(long, short = 'o', default_value = "")]
    pub output: String,
}

#[derive(serde::Serialize)]
struct CombineResult {
    status: &'static str,
    input1: String,
    input2: String,
    output: String,
    direction: String,
    width: u32,
    height: u32,
}

pub fn run(args: &CombineArgs, json: bool) -> Result<()> {
    let img1 = internal::open_image(&args.file1)?;
    let img2 = internal::open_image(&args.file2)?;
    let (w1, h1) = img1.dimensions();
    let (w2, h2) = img2.dimensions();
    let (dst, dx, dy) = if args.direction == "vertical" {
        let w = w1.max(w2);
        let mut d = RgbaImage::new(w, h1 + h2);
        overlay(&mut d, &img1, 0, 0);
        overlay(&mut d, &img2, 0, h1 as i64);
        (d, 0i64, 0i64)
    } else {
        let h = h1.max(h2);
        let mut d = RgbaImage::new(w1 + w2, h);
        overlay(&mut d, &img1, 0, 0);
        overlay(&mut d, &img2, w1 as i64, 0);
        (d, 0i64, 0i64)
    };
    let _ = (dx, dy);
    let out_path = if args.output.is_empty() {
        internal::default_output(&args.file1, "_combined")
    } else {
        args.output.clone()
    };
    internal::save_image(&dst, &out_path)?;
    if json {
        println!(
            "{}",
            serde_json::to_string(&CombineResult {
                status: "ok",
                input1: args.file1.clone(),
                input2: args.file2.clone(),
                output: out_path,
                direction: args.direction.clone(),
                width: dst.width(),
                height: dst.height(),
            })?
        );
    } else {
        println!("{out_path}");
    }
    Ok(())
}
