//! Player subcommands.
pub mod leaderboard;
pub mod top10;

use anyhow::Result;
use clap::{Args, Subcommand};

#[derive(Args)]
pub struct PlayerArgs {
    #[command(subcommand)]
    pub command: PlayerCommand,
}

#[derive(Subcommand)]
pub enum PlayerCommand {
    /// Top 10 players for all rating categories
    Top10(top10::Top10Args),
    /// Top N players for a specific rating type
    Leaderboard(leaderboard::LeaderboardArgs),
}

pub fn run(args: &PlayerArgs) -> Result<()> {
    match &args.command {
        PlayerCommand::Top10(a) => top10::run(a),
        PlayerCommand::Leaderboard(a) => leaderboard::run(a),
    }
}
