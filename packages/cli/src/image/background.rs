use super::internal;
use anyhow::Result;
use clap::Args;

#[derive(Args)]
pub struct BackgroundArgs {
    /// Input image file
    pub file: String,
    /// Replacement color
    #[arg(long, short = 'c', default_value = "white")]
    pub color: String,
    /// Color similarity threshold
    #[arg(long, short = 't', default_value_t = 0.5)]
    pub threshold: f64,
    /// Output file path
    #[arg(long, short = 'o', default_value = "")]
    pub output: String,
}

#[derive(serde::Serialize)]
struct BgResult {
    status: &'static str,
    input: String,
    output: String,
    color: String,
    threshold: f64,
}

pub fn run(args: &BackgroundArgs, json: bool) -> Result<()> {
    let mut img = internal::open_image(&args.file)?;
    let ref_px = img.get_pixel(0, 0).0;
    let (ref_r, ref_g, ref_b) = (ref_px[0] as f64, ref_px[1] as f64, ref_px[2] as f64);
    let bg = internal::parse_color(&args.color, [255, 255, 255, 255]);
    let max_dist = args.threshold * 255.0 * 3.0f64.sqrt();
    for p in img.pixels_mut() {
        let dr = p[0] as f64 - ref_r;
        let dg = p[1] as f64 - ref_g;
        let db = p[2] as f64 - ref_b;
        if (dr * dr + dg * dg + db * db).sqrt() <= max_dist {
            p.0 = bg;
        }
    }
    let out_path = if args.output.is_empty() {
        internal::default_output(&args.file, "_background")
    } else {
        args.output.clone()
    };
    internal::save_image(&img, &out_path)?;
    if json {
        println!(
            "{}",
            serde_json::to_string(&BgResult {
                status: "ok",
                input: args.file.clone(),
                output: out_path,
                color: args.color.clone(),
                threshold: args.threshold,
            })?
        );
    } else {
        println!("{out_path}");
    }
    Ok(())
}
