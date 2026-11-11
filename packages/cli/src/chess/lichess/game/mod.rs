//! Game subcommands.
pub mod export;

use anyhow::Result;
use clap::{Args, Subcommand};

#[derive(Args)]
pub struct GameArgs {
    #[command(subcommand)]
    pub command: GameCommand,
}

#[derive(Subcommand)]
pub enum GameCommand {
    /// Export a game in JSON format
    Export(export::ExportArgs),
}

pub fn run(args: &GameArgs) -> Result<()> {
    match &args.command {
        GameCommand::Export(a) => export::run(a),
    }
}
