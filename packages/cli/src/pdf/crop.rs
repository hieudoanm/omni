use crate::pdf::internal::*;
use anyhow::{bail, Result};
use clap::Args;

#[derive(Args)]
pub struct CropArgs {
    /// PDF file
    pub file: String,
    /// Bounding box (llx lly urx ury) in PDF points
    #[arg(long, default_value = "0 0 612 792")]
    pub bbox: String,
    /// Page ranges to crop (default: all)
    #[arg(long, short = 'p', default_value = "")]
    pub pages: String,
    /// Output file path (default: overwrite input)
    #[arg(long, short = 'o', default_value = "")]
    pub output: String,
}

pub fn run(args: &CropArgs) -> Result<()> {
    let vals: Vec<f64> = args
        .bbox
        .split_whitespace()
        .map(|s| s.parse::<f64>())
        .collect::<Result<_, _>>()
        .map_err(|_| anyhow::anyhow!("invalid bbox {}", args.bbox))?;
    if vals.len() != 4 {
        bail!("bbox must have 4 values (llx lly urx ury)");
    }
    let b = [vals[0], vals[1], vals[2], vals[3]];
    let mut doc = load(&args.file)?;
    let out = output_or(&args.file, &args.output);
    let spec = if args.pages.is_empty() {
        "1-".into()
    } else {
        args.pages.clone()
    };
    for id in page_ids(&doc, &spec)? {
        let page = page_dict_mut(&mut doc, id)?;
        set_page_box(page, b"CropBox", b);
    }
    save(&mut doc, &out)?;
    println!("Cropped {}", args.file);
    Ok(())
}
