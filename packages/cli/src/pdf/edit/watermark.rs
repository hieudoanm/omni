use crate::pdf::internal::*;
use anyhow::Result;
use clap::Args;

#[derive(Args)]
pub struct WatermarkArgs {
    /// PDF file
    pub file: String,
    /// Watermark text
    #[arg(long, short = 't', default_value = "DRAFT")]
    pub text: String,
    /// Output file path (default: overwrite input)
    #[arg(long, short = 'o', default_value = "")]
    pub output: String,
    /// Page range (default: all)
    #[arg(long, short = 'p', default_value = "1-")]
    pub pages: String,
    /// Opacity (0.0 - 1.0)
    #[arg(long, default_value_t = 0.5)]
    pub opacity: f64,
}

pub fn run(args: &WatermarkArgs) -> Result<()> {
    let mut doc = load(&args.file)?;
    let out = output_or(&args.file, &args.output);
    let alpha = format!("{:.2}", args.opacity.clamp(0.0, 1.0));
    for id in page_ids(&doc, &args.pages)? {
        let page = page_dict(&doc, id)?;
        let b = full_box(page);
        let w = b[2] - b[0];
        let h = b[3] - b[1];
        let size = (w.min(h) / 8.0).max(24.0);
        // tile the text across the page
        let mut ops = format!("{} g\n", alpha);
        let step_x = w / 2.0;
        let step_y = h / 3.0;
        let mut row = 0;
        let mut y = b[1] + step_y;
        while y < b[3] {
            let mut col = 0;
            let mut x = b[0] + step_x / 2.0;
            while x < b[2] {
                ops.push_str(&text_op(x, y, size, &args.text));
                ops.push('\n');
                col += 1;
                x += step_x * (args.text.len().max(1) as f64 * 0.28 + 1.0);
                let _ = col;
            }
            row += 1;
            y += step_y;
            let _ = row;
        }
        append_page_ops(&mut doc, id, &ops)?;
    }
    save(&mut doc, &out)?;
    println!("Added watermark to {}", out);
    Ok(())
}
