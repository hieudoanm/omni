pub mod group;
pub mod info;
pub mod round;

use anyhow::Result;
use clap::{Args, Subcommand};

#[derive(Args)]
pub struct TournamentArgs {
    #[command(subcommand)]
    pub command: TournamentCommand,
}

#[derive(Subcommand)]
pub enum TournamentCommand {
    /// Show tournament info
    Info(info::InfoArgs),
    /// Show tournament round
    Round(round::RoundArgs),
    /// Show tournament round group
    Group(group::GroupArgs),
}

pub fn run(args: &TournamentArgs) -> Result<()> {
    match &args.command {
        TournamentCommand::Info(a) => info::run(a),
        TournamentCommand::Round(a) => round::run(a),
        TournamentCommand::Group(a) => group::run(a),
    }
}
