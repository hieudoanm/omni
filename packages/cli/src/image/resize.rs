use super::internal;
use anyhow::Result;
use clap::Args;
use image::imageops::FilterType;

// -h is height's shorthand (cobra parity); --help is provided manually below.
#[derive(Args)]
#[command(disable_help_flag = true)]
pub struct ResizeArgs {
    /// Input image file
    pub file: String,
    /// Target width
    #[arg(long, short = 'w', default_value_t = 0)]
    pub width: u32,
    /// Target height
    #[arg(long, short = 'h', default_value_t = 0)]
    pub height: u32,
    /// Fit mode (contain, cover, fill, none)
    #[arg(long, short = 'f', default_value = "contain")]
    pub fit: String,
    /// Output file path
    #[arg(long, short = 'o', default_value = "")]
    pub output: String,
    /// Print help
    #[arg(long)]
    pub help: bool,
}

#[derive(serde::Serialize)]
struct ResizeResult {
    status: &'static str,
    input: String,
    output: String,
    width: u32,
    height: u32,
}

pub fn run(args: &ResizeArgs, json: bool) -> Result<()> {
    if args.help {
        let mut cmd = <ResizeArgs as clap::Args>::augment_args(clap::Command::new("resize"));
        let _ = cmd.print_help();
        return Ok(());
    }
    let img = internal::open_image(&args.file)?;
    let (iw, ih) = img.dimensions();
    let mut w = args.width;
    let mut h = args.height;
    if w == 0 {
        w = iw;
    }
    if h == 0 {
        h = ih;
    }
    let dst = match args.fit.as_str() {
        "cover" => {
            // Fill then center-crop to exact w,h
            let scale = (w as f64 / iw as f64).max(h as f64 / ih as f64);
            let nw = ((iw as f64 * scale).round() as u32).max(1);
            let nh = ((ih as f64 * scale).round() as u32).max(1);
            let resized = image::imageops::resize(&img, nw, nh, FilterType::Lanczos3);
            let x = nw.saturating_sub(w) / 2;
            let y = nh.saturating_sub(h) / 2;
            image::imageops::crop_imm(&resized, x, y, w.min(nw), h.min(nh)).to_image()
        }
        "fill" | "none" => image::imageops::resize(&img, w, h, FilterType::Lanczos3),
        _ => {
            // contain: fit within w,h preserving aspect
            let scale = (w as f64 / iw as f64).min(h as f64 / ih as f64);
            let nw = ((iw as f64 * scale).round() as u32).max(1);
            let nh = ((ih as f64 * scale).round() as u32).max(1);
            image::imageops::resize(&img, nw, nh, FilterType::Lanczos3)
        }
    };
    let out_path = if args.output.is_empty() {
        internal::default_output(&args.file, "_resized")
    } else {
        args.output.clone()
    };
    internal::save_image(&dst, &out_path)?;
    if json {
        println!(
            "{}",
            serde_json::to_string(&ResizeResult {
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
