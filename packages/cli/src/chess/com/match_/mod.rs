pub mod daily;
pub mod daily_board;
pub mod live;
pub mod live_board;

use anyhow::Result;
use clap::{Args, Subcommand};

#[derive(Args)]
pub struct MatchArgs {
    #[command(subcommand)]
    pub command: MatchCommand,
}

#[derive(Subcommand)]
pub enum MatchCommand {
    /// Show daily team match
    Daily(daily::DailyArgs),
    /// Show daily team match board
    #[command(name = "daily-board")]
    DailyBoard(daily_board::DailyBoardArgs),
    /// Show live team match
    Live(live::LiveArgs),
    /// Show live team match board
    #[command(name = "live-board")]
    LiveBoard(live_board::LiveBoardArgs),
}

pub fn run(args: &MatchArgs) -> Result<()> {
    match &args.command {
        MatchCommand::Daily(a) => daily::run(a),
        MatchCommand::DailyBoard(a) => daily_board::run(a),
        MatchCommand::Live(a) => live::run(a),
        MatchCommand::LiveBoard(a) => live_board::run(a),
    }
}
