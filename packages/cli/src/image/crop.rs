use super::internal;
use anyhow::{anyhow, Result};
use clap::Args;
use image::imageops::crop_imm;

// -h is height's shorthand (cobra parity); --help is provided manually below.
#[derive(Args)]
#[command(disable_help_flag = true)]
pub struct CropArgs {
    /// Input image file
    pub file: String,
    /// Crop X offset
    #[arg(long, short = 'x', default_value_t = 0)]
    pub x: i64,
    /// Crop Y offset
    #[arg(long, short = 'y', default_value_t = 0)]
    pub y: i64,
    /// Crop width
    #[arg(long, short = 'w', default_value_t = 0)]
    pub width: i64,
    /// Crop height
    #[arg(long, short = 'h', default_value_t = 0)]
    pub height: i64,
    /// Crop from center
    #[arg(long, short = 'c')]
    pub center: bool,
    /// Output file path
    #[arg(long, short = 'o', default_value = "")]
    pub output: String,
    /// Print help
    #[arg(long)]
    pub help: bool,
}

#[derive(serde::Serialize)]
struct CropResult {
    status: &'static str,
    input: String,
    output: String,
    width: u32,
    height: u32,
}

pub fn run(args: &CropArgs, json: bool) -> Result<()> {
    if args.help {
        let mut cmd = <CropArgs as clap::Args>::augment_args(clap::Command::new("crop"));
        let _ = cmd.print_help();
        return Ok(());
    }
    let img = internal::open_image(&args.file)?;
    let dst = if args.center {
        if args.width == 0 || args.height == 0 {
            return Err(anyhow!("width and height required for center crop"));
        }
        let (w, h) = img.dimensions();
        let x = (w as i64 - args.width) / 2;
        let y = (h as i64 - args.height) / 2;
        crop_imm(
            &img,
            x as u32,
            y as u32,
            args.width as u32,
            args.height as u32,
        )
        .to_image()
    } else {
        let (w, h) = img.dimensions();
        let cw = if args.width == 0 {
            w as i64 - args.x
        } else {
            args.width
        };
        let ch = if args.height == 0 {
            h as i64 - args.y
        } else {
            args.height
        };
        crop_imm(&img, args.x as u32, args.y as u32, cw as u32, ch as u32).to_image()
    };
    let out_path = if args.output.is_empty() {
        internal::default_output(&args.file, "_cropped")
    } else {
        args.output.clone()
    };
    internal::save_image(&dst, &out_path)?;
    if json {
        println!(
            "{}",
            serde_json::to_string(&CropResult {
                status: "ok",
                input: args.file.clone(),
                output: out_path,
                width: dst.width(),
                height: dst.height(),
            })?
        );
    } else {
        println!("{out_path}");
    }
    Ok(())
}
