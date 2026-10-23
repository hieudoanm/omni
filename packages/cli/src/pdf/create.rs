use crate::pdf::internal::*;
use anyhow::{bail, Result};
use clap::Args;
use std::fs;

#[derive(Args)]
pub struct CreateArgs {
    /// Text content to include in PDF
    #[arg(long, default_value = "")]
    pub text: String,
    /// Read text from file
    #[arg(long, default_value = "")]
    pub file: String,
    /// Output PDF file path
    #[arg(long, short = 'o', default_value = "created.pdf")]
    pub output: String,
}

const PAGE_W: f64 = 595.0;
const PAGE_H: f64 = 842.0;

pub fn run(args: &CreateArgs) -> Result<()> {
    let mut content = args.text.clone();
    if !args.file.is_empty() {
        let data = fs::read_to_string(&args.file)
            .map_err(|e| anyhow::anyhow!("cannot read {}: {}", args.file, e))?;
        if !content.is_empty() {
            content.push('\n');
        }
        content.push_str(&data);
    }
    if content.trim().is_empty() {
        bail!("provide text via --text or --file");
    }
    let mut doc = blank_document(PAGE_W, PAGE_H);
    // chunk lines into pages of ~48 lines
    let lines: Vec<&str> = content.lines().collect();
    for chunk in lines.chunks(48) {
        add_blank_page(&mut doc, PAGE_W, PAGE_H, Some(&chunk.join("\n")))?;
    }
    save(&mut doc, &args.output)?;
    println!("Created {}", args.output);
    Ok(())
}
