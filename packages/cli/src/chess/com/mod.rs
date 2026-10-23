pub mod club;
pub mod country;
pub mod internal;
pub mod leaderboards;
pub mod match_;
pub mod player;
pub mod puzzle;
pub mod streamer;
pub mod titled;
pub mod tournament;

use anyhow::Result;
use clap::{Args, Subcommand};
use match_::MatchArgs;

#[derive(Args)]
pub struct ComArgs {
    #[command(subcommand)]
    pub command: ComCommand,
}

#[derive(Subcommand)]
pub enum ComCommand {
    /// Show player profile, stats, games and tournaments
    Player(player::PlayerArgs),
    /// Show club profile, members and matches
    Club(club::ClubArgs),
    /// Show country profile, players and clubs
    Country(country::CountryArgs),
    /// Show live leaderboards
    Leaderboards(leaderboards::LeaderboardsArgs),
    /// Show team matches
    Match(MatchArgs),
    /// Show tournaments
    Tournament(tournament::TournamentArgs),
    /// Show puzzles
    Puzzle(puzzle::PuzzleArgs),
    /// List chess streamers
    Streamer(streamer::StreamerArgs),
    /// Count titled players
    Titled(titled::TitledArgs),
}

pub fn run(args: &ComArgs) -> Result<()> {
    match &args.command {
        ComCommand::Player(a) => player::run(a),
        ComCommand::Club(a) => club::run(a),
        ComCommand::Country(a) => country::run(a),
        ComCommand::Leaderboards(a) => leaderboards::run(a),
        ComCommand::Match(a) => match_::run(a),
        ComCommand::Tournament(a) => tournament::run(a),
        ComCommand::Puzzle(a) => puzzle::run(a),
        ComCommand::Streamer(a) => streamer::run(a),
        ComCommand::Titled(a) => titled::run(a),
    }
}
