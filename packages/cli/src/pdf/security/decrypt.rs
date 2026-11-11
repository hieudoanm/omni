use crate::pdf::internal::*;
use anyhow::{bail, Result};
use clap::Args;
use lopdf::Document;

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
    let mut doc = match Document::load_with_password(&args.file, &args.password) {
        Ok(doc) => doc,
        Err(lopdf::Error::InvalidPassword) => {
            bail!("incorrect password for {}", args.file)
        }
        Err(e) => {
            return Err(anyhow::Error::new(e).context(format!("cannot open {}", args.file)));
        }
    };
    if !doc.was_encrypted() {
        bail!("{} is not encrypted", args.file);
    }
    let out = output_or(&args.file, &args.output);
    save(&mut doc, &out)?;
    println!("Decrypted {}", out);
    Ok(())
}
