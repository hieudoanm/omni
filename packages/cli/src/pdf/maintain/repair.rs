use crate::pdf::internal::*;
use anyhow::Result;
use clap::Args;
use std::path::Path;

#[derive(Args)]
pub struct RepairArgs {
    /// PDF file
    pub file: String,
    /// Output file path (default: <file>.repaired.pdf)
    #[arg(long, short = 'o', default_value = "")]
    pub output: String,
}

pub fn run(args: &RepairArgs) -> Result<()> {
    let mut doc = load(&args.file)?;
    let out = if args.output.is_empty() {
        let ext = Path::new(&args.file)
            .extension()
            .and_then(|e| e.to_str())
            .unwrap_or("");
        let base = args.file.trim_end_matches(&format!(".{}", ext));
        format!("{}.repaired.pdf", base)
    } else {
        args.output.clone()
    };
    save(&mut doc, &out)?;
    println!("Repaired {} -> {}", args.file, out);
    Ok(())
}
