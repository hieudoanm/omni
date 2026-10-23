//! Player subcommands.
pub mod archive;
pub mod archives;
pub mod clubs;
pub mod games;
pub mod live;
pub mod matches;
pub mod online;
pub mod pgn;
pub mod profile;
pub mod stats;
pub mod to_move;
pub mod tournaments;

use anyhow::Result;
use clap::{Args, Subcommand};

#[derive(Args)]
pub struct PlayerArgs {
    #[command(subcommand)]
    pub command: PlayerCommand,
}

#[derive(Subcommand)]
pub enum PlayerCommand {
    /// Show Chess.com player profile
    Profile(profile::ProfileArgs),
    /// Show Chess.com player stats
    Stats(stats::StatsArgs),
    /// Check if a player is online
    Online(online::OnlineArgs),
    /// Show current daily chess games
    Games(games::GamesArgs),
    /// Show games where it's the player's turn
    #[command(name = "to-move")]
    ToMove(to_move::ToMoveArgs),
    /// List monthly game archives
    Archives(archives::ArchivesArgs),
    /// Show monthly game archive
    Archive(archive::ArchiveArgs),
    /// Show live game archive by time control
    Live(live::LiveArgs),
    /// Download PGN of monthly games
    Pgn(pgn::PgnArgs),
    /// Show player's clubs
    Clubs(clubs::ClubsArgs),
    /// Show player's team matches
    Matches(matches::MatchesArgs),
    /// Show player's tournaments
    Tournaments(tournaments::TournamentsArgs),
}

pub fn run(args: &PlayerArgs) -> Result<()> {
    match &args.command {
        PlayerCommand::Profile(a) => profile::run(a),
        PlayerCommand::Stats(a) => stats::run(a),
        PlayerCommand::Online(a) => online::run(a),
        PlayerCommand::Games(a) => games::run(a),
        PlayerCommand::ToMove(a) => to_move::run(a),
        PlayerCommand::Archives(a) => archives::run(a),
        PlayerCommand::Archive(a) => archive::run(a),
        PlayerCommand::Live(a) => live::run(a),
        PlayerCommand::Pgn(a) => pgn::run(a),
        PlayerCommand::Clubs(a) => clubs::run(a),
        PlayerCommand::Matches(a) => matches::run(a),
        PlayerCommand::Tournaments(a) => tournaments::run(a),
    }
}
