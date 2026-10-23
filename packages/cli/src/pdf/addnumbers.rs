use crate::pdf::internal::*;
use anyhow::{bail, Result};
use clap::Args;
use lopdf::ObjectId;

#[derive(Args)]
pub struct AddNumbersArgs {
    /// PDF file
    pub file: String,
    /// Page number format ({n}=number, {total}=total)
    #[arg(long, default_value = "Page {n} of {total}")]
    pub format: String,
    /// Starting page number
    #[arg(long, default_value_t = 1)]
    pub start: i64,
    /// Position: top-left, top-center, top-right, bottom-left, bottom-center, bottom-right
    #[arg(long, default_value = "bottom-center")]
    pub position: String,
    /// Output file path (default: overwrite input)
    #[arg(long, short = 'o', default_value = "")]
    pub output: String,
}

fn anchor(pos: &str, b: [f64; 4]) -> Result<(f64, f64)> {
    let w = b[2] - b[0];
    let h = b[3] - b[1];
    let (fx, fy) = match pos {
        "top-left" => (0.05, 0.95),
        "top-center" => (0.5, 0.95),
        "top-right" => (0.95, 0.95),
        "bottom-left" => (0.05, 0.05),
        "bottom-center" => (0.5, 0.05),
        "bottom-right" => (0.95, 0.05),
        other => bail!("unknown position {}", other),
    };
    Ok((b[0] + w * fx, b[1] + h * fy))
}

pub fn run(args: &AddNumbersArgs) -> Result<()> {
    let mut doc = load(&args.file)?;
    let out = output_or(&args.file, &args.output);
    let pages = doc.get_pages();
    let total = pages.len() as i64;
    let mut ids: Vec<ObjectId> = pages.values().copied().collect();
    ids.sort_by_key(|id| {
        pages
            .iter()
            .find(|(_, v)| *v == id)
            .map(|(n, _)| *n)
            .unwrap_or(0)
    });
    for (i, id) in ids.iter().enumerate() {
        let num = args.start + i as i64;
        let text = args
            .format
            .replace("{n}", &num.to_string())
            .replace("{total}", &total.to_string());
        let page = page_dict(&doc, *id)?;
        let b = full_box(page);
        let (fx, fy) = anchor(&args.position, b)?;
        let size = 12.0;
        // estimate width: 6pt per char at size 12
        let est_w = text.len() as f64 * size * 0.5;
        let x = match args.position.as_str() {
            p if p.ends_with("left") => fx,
            p if p.ends_with("right") => fx - est_w,
            _ => fx - est_w / 2.0,
        };
        let ops = text_op(x, fy, size, &text);
        append_page_ops(&mut doc, *id, &ops)?;
    }
    save(&mut doc, &out)?;
    println!("Added page numbers to {}", out);
    Ok(())
}
