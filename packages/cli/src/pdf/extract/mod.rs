pub mod images;
pub mod text;

use anyhow::Result;
use clap::{Args, Subcommand};

#[derive(Args)]
pub struct ExtractArgs {
    #[command(subcommand)]
    pub command: ExtractCommand,
}

#[derive(Subcommand)]
pub enum ExtractCommand {
    /// Extract embedded images from a PDF
    Images(images::ImagesArgs),
    /// Extract text from a PDF
    Text(text::TextArgs),
}

pub fn run(args: &ExtractArgs) -> Result<()> {
    match &args.command {
        ExtractCommand::Images(a) => images::run(a),
        ExtractCommand::Text(a) => text::run(a),
    }
}
