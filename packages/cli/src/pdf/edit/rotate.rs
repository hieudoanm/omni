use crate::pdf::internal::*;
use anyhow::Result;
use clap::Args;

#[derive(Args)]
pub struct RotateArgs {
    /// PDF file
    pub file: String,
    /// Rotation angle (90, 180, 270)
    #[arg(long, short = 'a', default_value_t = 90)]
    pub angle: i64,
    /// Page range to rotate (default: all)
    #[arg(long, short = 'p', default_value = "1-")]
    pub pages: String,
    /// Output file path (default: overwrite input)
    #[arg(long, short = 'o', default_value = "")]
    pub output: String,
}

pub fn run(args: &RotateArgs) -> Result<()> {
    let mut doc = load(&args.file)?;
    let out = output_or(&args.file, &args.output);
    for id in page_ids(&doc, &args.pages)? {
        rotate_page(&mut doc, id, args.angle)?;
    }
    save(&mut doc, &out)?;
    println!("Rotated pages {} by {}°", args.pages, args.angle);
    Ok(())
}
