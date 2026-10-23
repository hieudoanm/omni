use super::internal;
use anyhow::Result;
use clap::Args;
use image::imageops::colorops::grayscale;

#[derive(Args)]
pub struct GrayscaleArgs {
    /// Input image file
    pub file: String,
    /// Output file path
    #[arg(long, short = 'o', default_value = "")]
    pub output: String,
}

#[derive(serde::Serialize)]
struct GrayResult {
    status: &'static str,
    input: String,
    output: String,
}

pub fn run(args: &GrayscaleArgs, json: bool) -> Result<()> {
    let img = internal::open_image(&args.file)?;
    let gray = grayscale(&img);
    let dst = image::DynamicImage::ImageLuma8(gray).to_rgba8();
    let out_path = if args.output.is_empty() {
        internal::default_output(&args.file, "_grayscale")
    } else {
        args.output.clone()
    };
    internal::save_image(&dst, &out_path)?;
    if json {
        println!(
            "{}",
            serde_json::to_string(&GrayResult {
                status: "ok",
                input: args.file.clone(),
                output: out_path,
            })?
        );
    } else {
        println!("{out_path}");
    }
    Ok(())
}
