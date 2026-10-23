use crate::pdf::internal::*;
use anyhow::Result;
use clap::Args;

#[derive(Args)]
pub struct MergeArgs {
    /// PDF files to merge
    pub files: Vec<String>,
    /// Output file path
    #[arg(long, short = 'o', default_value = "merged.pdf")]
    pub output: String,
}

pub fn run(args: &MergeArgs) -> Result<()> {
    anyhow::ensure!(!args.files.is_empty(), "at least one input file required");
    let mut doc = blank_document(612.0, 792.0);
    let mut all = Vec::new();
    for f in &args.files {
        let src = load(f)?;
        all.extend(import_pages(&mut doc, &src)?);
    }
    set_kids(&mut doc, &all)?;
    save(&mut doc, &args.output)?;
    println!("Merged {} files into {}", args.files.len(), args.output);
    Ok(())
}
