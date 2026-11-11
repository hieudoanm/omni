use crate::pdf::internal::*;
use anyhow::Result;
use clap::Args;

#[derive(Args)]
pub struct CompressArgs {
    /// PDF file
    pub file: String,
    /// Output file path (default: overwrite input)
    #[arg(long, short = 'o', default_value = "")]
    pub output: String,
}

pub fn run(args: &CompressArgs) -> Result<()> {
    let mut doc = load(&args.file)?;
    let out = output_or(&args.file, &args.output);
    save(&mut doc, &out)?;
    println!("Compressed {}", out);
    Ok(())
}
