pub mod compress;
pub mod redact;
pub mod rotate;
pub mod watermark;

use anyhow::Result;
use clap::{Args, Subcommand};

#[derive(Args)]
pub struct EditArgs {
    #[command(subcommand)]
    pub command: EditCommand,
}

#[derive(Subcommand)]
pub enum EditCommand {
    /// Compress a PDF file
    Compress(compress::CompressArgs),
    /// Redact pages or regions in a PDF
    Redact(redact::RedactArgs),
    /// Rotate pages in a PDF
    Rotate(rotate::RotateArgs),
    /// Add a text watermark to a PDF
    Watermark(watermark::WatermarkArgs),
}

pub fn run(args: &EditArgs) -> Result<()> {
    match &args.command {
        EditCommand::Compress(a) => compress::run(a),
        EditCommand::Redact(a) => redact::run(a),
        EditCommand::Rotate(a) => rotate::run(a),
        EditCommand::Watermark(a) => watermark::run(a),
    }
}
