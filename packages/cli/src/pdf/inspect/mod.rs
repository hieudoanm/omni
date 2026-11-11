pub mod info;
pub mod metadata;

use anyhow::Result;
use clap::{Args, Subcommand};

#[derive(Args)]
pub struct InspectArgs {
    #[command(subcommand)]
    pub command: InspectCommand,
}

#[derive(Subcommand)]
pub enum InspectCommand {
    /// Show PDF file information
    Info(info::InfoArgs),
    /// View or set PDF metadata
    Metadata(metadata::MetadataArgs),
}

pub fn run(args: &InspectArgs) -> Result<()> {
    match &args.command {
        InspectCommand::Info(a) => info::run(a),
        InspectCommand::Metadata(a) => metadata::run(a),
    }
}
