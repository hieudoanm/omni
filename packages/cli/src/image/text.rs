use super::internal;
use anyhow::Result;
use clap::Args;

#[derive(Args)]
pub struct TextArgs {
    /// Input image file
    pub file: String,
    /// Text to overlay
    #[arg(long, short = 't', default_value = "")]
    pub text: String,
    /// Text color
    #[arg(long, short = 'c', default_value = "white")]
    pub color: String,
    /// X position
    #[arg(long, short = 'x', default_value_t = 10)]
    pub x: i64,
    /// Y position
    #[arg(long, short = 'y', default_value_t = 10)]
    pub y: i64,
    /// Font size (accepted for compatibility; 7x13 bitmap font is fixed)
    #[arg(long, short = 's', default_value_t = 24.0)]
    pub size: f64,
    /// Output file path
    #[arg(long, short = 'o', default_value = "")]
    pub output: String,
}

#[derive(serde::Serialize)]
struct TextResult {
    status: &'static str,
    input: String,
    output: String,
    text: String,
}

pub fn run(args: &TextArgs, json: bool) -> Result<()> {
    let mut img = internal::open_image(&args.file)?;
    let col = internal::parse_color(&args.color, [255, 255, 255, 255]);
    internal::draw_text(&mut img, args.x, args.y, &args.text, col);
    let _ = img.width();
    let out_path = if args.output.is_empty() {
        internal::default_output(&args.file, "_text")
    } else {
        args.output.clone()
    };
    internal::save_image(&img, &out_path)?;
    if json {
        println!(
            "{}",
            serde_json::to_string(&TextResult {
                status: "ok",
                input: args.file.clone(),
                output: out_path,
                text: args.text.clone(),
            })?
        );
    } else {
        println!("{out_path}");
    }
    Ok(())
}
