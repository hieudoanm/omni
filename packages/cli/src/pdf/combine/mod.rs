pub mod merge;
pub mod split;

use anyhow::Result;
use clap::{Args, Subcommand};

#[derive(Args)]
pub struct CombineArgs {
    #[command(subcommand)]
    pub command: CombineCommand,
}

#[derive(Subcommand)]
pub enum CombineCommand {
    /// Merge multiple PDFs into one
    Merge(merge::MergeArgs),
    /// Split a PDF into multiple files
    Split(split::SplitArgs),
}

pub fn run(args: &CombineArgs) -> Result<()> {
    match &args.command {
        CombineCommand::Merge(a) => merge::run(a),
        CombineCommand::Split(a) => split::run(a),
    }
}
