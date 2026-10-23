pub mod fromimages;
pub mod toimages;

use anyhow::Result;
use clap::{Args, Subcommand};

#[derive(Args)]
pub struct ConvertArgs {
    #[command(subcommand)]
    pub command: ConvertCommand,
}

#[derive(Subcommand)]
pub enum ConvertCommand {
    /// Create a PDF from image files
    #[command(name = "from-images")]
    FromImages(fromimages::FromImagesArgs),
    /// Export PDF pages as images
    #[command(name = "to-images")]
    ToImages(toimages::ToImagesArgs),
}

pub fn run(args: &ConvertArgs) -> Result<()> {
    match &args.command {
        ConvertCommand::FromImages(a) => fromimages::run(a),
        ConvertCommand::ToImages(a) => toimages::run(a),
    }
}
