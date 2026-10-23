//! Tournament subcommands.
pub mod info;
pub mod results;

use anyhow::Result;
use clap::{Args, Subcommand};

#[derive(Args)]
pub struct TournamentArgs {
    #[command(subcommand)]
    pub command: TournamentCommand,
}

#[derive(Subcommand)]
pub enum TournamentCommand {
    /// Fetch tournament details
    Info(info::InfoArgs),
    /// Fetch tournament results
    Results(results::ResultsArgs),
}

pub fn run(args: &TournamentArgs) -> Result<()> {
    match &args.command {
        TournamentCommand::Info(a) => info::run(a),
        TournamentCommand::Results(a) => results::run(a),
    }
}
