//! Puzzle subcommands.
pub mod by_id;
pub mod daily;

use anyhow::Result;
use clap::{Args, Subcommand};

#[derive(Args)]
pub struct PuzzleArgs {
    #[command(subcommand)]
    pub command: PuzzleCommand,
}

#[derive(Subcommand)]
pub enum PuzzleCommand {
    /// Fetch the daily puzzle
    Daily(daily::DailyArgs),
    /// Fetch a puzzle by ID
    #[command(name = "by-id")]
    ById(by_id::ByIdArgs),
}

pub fn run(args: &PuzzleArgs) -> Result<()> {
    match &args.command {
        PuzzleCommand::Daily(a) => daily::run(a),
        PuzzleCommand::ById(a) => by_id::run(a),
    }
}
