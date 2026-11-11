use crate::pdf::internal::*;
use anyhow::{bail, Result};
use clap::Args;

#[derive(Args)]
pub struct DecryptArgs {
    /// PDF file
    pub file: String,
    /// Current password of the PDF
    #[arg(long, short = 'p', default_value = "")]
    pub password: String,
    /// Output file path (default: overwrite input)
    #[arg(long, short = 'o', default_value = "")]
    pub output: String,
}

pub fn run(args: &DecryptArgs) -> Result<()> {
    let mut doc = load(&args.file)?;
    if doc.is_encrypted() {
        doc.decrypt(&args.password)
            .map_err(|e| anyhow::anyhow!("decrypt failed: {}", e))?;
    } else if !doc.was_encrypted() {
        bail!("{} is not encrypted", args.file);
    }
    let out = output_or(&args.file, &args.output);
    save(&mut doc, &out)?;
    println!("Decrypted {}", out);
    Ok(())
}
