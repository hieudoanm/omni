pub mod daily;
pub mod random;

use anyhow::Result;
use clap::{Args, Subcommand};

#[derive(Args)]
pub struct PuzzleArgs {
    #[command(subcommand)]
    pub command: PuzzleCommand,
}

#[derive(Subcommand)]
pub enum PuzzleCommand {
    /// Show daily puzzle
    Daily(daily::DailyArgs),
    /// Show random puzzle
    Random(random::RandomArgs),
}

pub fn run(args: &PuzzleArgs) -> Result<()> {
    match &args.command {
        PuzzleCommand::Daily(a) => daily::run(a),
        PuzzleCommand::Random(a) => random::run(a),
    }
}
