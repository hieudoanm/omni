//! Lichess tools and API client (ported from cli.go chess/lichess.org).
pub mod client;
pub mod cloud_eval;
pub mod crosstable;
pub mod game;
pub mod opening;
pub mod player;
pub mod puzzle;
pub mod streamer;
pub mod study;
pub mod tablebase;
pub mod team;
pub mod tournament;
pub mod tv;
pub mod user;

use anyhow::Result;
use clap::{Args, Subcommand};

#[derive(Args)]
pub struct LichessArgs {
    #[command(subcommand)]
    pub command: LichessCommand,
}

#[derive(Subcommand)]
pub enum LichessCommand {
    /// User information and stats
    User(user::UserArgs),
    /// Puzzle of the day and puzzle lookup
    Puzzle(puzzle::PuzzleArgs),
    /// Game export and analysis
    Game(game::GameArgs),
    /// Top players and leaderboards
    Player(player::PlayerArgs),
    /// Lichess TV channels
    Tv(tv::TvArgs),
    /// List live streamers
    Streamer(streamer::StreamerArgs),
    /// Head-to-head statistics between two users
    Crosstable(crosstable::CrosstableArgs),
    /// Tournament information and results
    Tournament(tournament::TournamentArgs),
    /// Fetch team information
    Team(team::TeamArgs),
    /// Export a study as PGN
    Study(study::StudyArgs),
    /// Syzygy tablebase lookup for endgame positions
    Tablebase(tablebase::TablebaseArgs),
    /// Masters opening explorer
    Opening(opening::OpeningArgs),
}

pub fn run(args: &LichessArgs) -> Result<()> {
    match &args.command {
        LichessCommand::User(a) => user::run(a),
        LichessCommand::Puzzle(a) => puzzle::run(a),
        LichessCommand::Game(a) => game::run(a),
        LichessCommand::Player(a) => player::run(a),
        LichessCommand::Tv(a) => tv::run(a),
        LichessCommand::Streamer(a) => streamer::run(a),
        LichessCommand::Crosstable(a) => crosstable::run(a),
        LichessCommand::Tournament(a) => tournament::run(a),
        LichessCommand::Team(a) => team::run(a),
        LichessCommand::Study(a) => study::run(a),
        LichessCommand::Tablebase(a) => tablebase::run(a),
        LichessCommand::Opening(a) => opening::run(a),
    }
}
