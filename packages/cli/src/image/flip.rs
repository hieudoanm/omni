use super::internal;
use anyhow::Result;
use clap::Args;
use image::imageops::{flip_horizontal, flip_vertical};

#[derive(Args)]
pub struct FlipArgs {
    /// Input image file
    pub file: String,
    /// Flip horizontally
    #[arg(long, short = 'H')]
    pub horizontal: bool,
    /// Flip vertically
    #[arg(long, short = 'V')]
    pub vertical: bool,
    /// Output file path
    #[arg(long, short = 'o', default_value = "")]
    pub output: String,
}

#[derive(serde::Serialize)]
struct FlipResult {
    status: &'static str,
    input: String,
    output: String,
    horizontal: bool,
    vertical: bool,
}

pub fn run(args: &FlipArgs, json: bool) -> Result<()> {
    let img = internal::open_image(&args.file)?;
    let dst = if args.vertical && !args.horizontal {
        flip_vertical(&img)
    } else {
        flip_horizontal(&img)
    };
    let out_path = if args.output.is_empty() {
        internal::default_output(&args.file, "_flipped")
    } else {
        args.output.clone()
    };
    internal::save_image(&dst, &out_path)?;
    if json {
        println!(
            "{}",
            serde_json::to_string(&FlipResult {
                status: "ok",
                input: args.file.clone(),
                output: out_path,
                horizontal: args.horizontal,
                vertical: args.vertical,
            })?
        );
    } else {
        println!("{out_path}");
    }
    Ok(())
}
