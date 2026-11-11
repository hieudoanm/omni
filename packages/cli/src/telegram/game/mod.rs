pub mod high_scores;
pub mod send;
pub mod set_score;

use anyhow::Result;
use clap::{Args, Subcommand};

#[derive(Args)]
pub struct GameArgs {
    #[command(subcommand)]
    pub command: Command,
}

#[derive(Subcommand)]
pub enum Command {
    /// Get game high scores
    #[command(name = "high-scores")]
    HighScores(high_scores::Args),
    /// Send a game
    Send(send::Args),
    /// Set a game score
    #[command(name = "set-score")]
    SetScore(set_score::Args),
}

pub fn run(args: &GameArgs) -> Result<()> {
    match &args.command {
        Command::HighScores(a) => high_scores::run(a),
        Command::Send(a) => send::run(a),
        Command::SetScore(a) => set_score::run(a),
    }
}
