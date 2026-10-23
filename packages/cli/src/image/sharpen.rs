use super::internal;
use anyhow::Result;
use clap::Args;

#[derive(Args)]
pub struct SharpenArgs {
    /// Input image file
    pub file: String,
    /// Sharpen amount
    #[arg(long, short = 'a', default_value_t = 1.0)]
    pub amount: f32,
    /// Output file path
    #[arg(long, short = 'o', default_value = "")]
    pub output: String,
}

#[derive(serde::Serialize)]
struct SharpenResult {
    status: &'static str,
    input: String,
    output: String,
    amount: f32,
}

/// Unsharp mask: img + amount * (img - gaussian_blur(img, sigma=amount)).
pub fn run(args: &SharpenArgs, json: bool) -> Result<()> {
    let img = internal::open_image(&args.file)?;
    let blurred = imageproc::filter::gaussian_blur_f32(&img, args.amount.max(0.1));
    let mut dst = img.clone();
    for (p, b) in dst.pixels_mut().zip(blurred.pixels()) {
        for i in 0..3 {
            let v = p[i] as f32 + args.amount * (p[i] as f32 - b[i] as f32);
            p[i] = v.clamp(0.0, 255.0) as u8;
        }
    }
    let _ = dst.width();
    let out_path = if args.output.is_empty() {
        internal::default_output(&args.file, "_sharpened")
    } else {
        args.output.clone()
    };
    internal::save_image(&dst, &out_path)?;
    if json {
        println!(
            "{}",
            serde_json::to_string(&SharpenResult {
                status: "ok",
                input: args.file.clone(),
                output: out_path,
                amount: args.amount,
            })?
        );
    } else {
        println!("{out_path}");
    }
    Ok(())
}
