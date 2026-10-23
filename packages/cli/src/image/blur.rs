use super::internal;
use anyhow::Result;
use clap::Args;

#[derive(Args)]
pub struct BlurArgs {
    /// Input image file
    pub file: String,
    /// Blur radius
    #[arg(long, short = 'r', default_value_t = 3.0)]
    pub radius: f32,
    /// Output file path
    #[arg(long, short = 'o', default_value = "")]
    pub output: String,
}

#[derive(serde::Serialize)]
struct BlurResult {
    status: &'static str,
    input: String,
    output: String,
    radius: f32,
}

pub fn run(args: &BlurArgs, json: bool) -> Result<()> {
    let img = internal::open_image(&args.file)?;
    let dst = imageproc::filter::gaussian_blur_f32(&img, args.radius);
    let out_path = if args.output.is_empty() {
        internal::default_output(&args.file, "_blurred")
    } else {
        args.output.clone()
    };
    internal::save_image(&dst, &out_path)?;
    if json {
        println!(
            "{}",
            serde_json::to_string(&BlurResult {
                status: "ok",
                input: args.file.clone(),
                output: out_path,
                radius: args.radius,
            })?
        );
    } else {
        println!("{out_path}");
    }
    Ok(())
}
