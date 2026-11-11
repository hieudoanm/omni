//! Chess tools: Elo calculators, Chess960, FEN/PGN utilities,
//! Lichess and Chess.com APIs (ported from cli.go chess).
pub mod chess960;
pub mod com;
pub mod elo;
pub mod fen;
pub mod internal;
pub mod lichess;
pub mod pgn;
pub mod pgn_parse;
pub mod play;
pub mod setup;

use anyhow::Result;
use clap::{Args, Subcommand};

#[derive(Args)]
pub struct ChessArgs {
    #[command(subcommand)]
    pub command: ChessCommand,
}

#[derive(Subcommand)]
pub enum ChessCommand {
    /// Elo rating calculators
    Elo(elo::EloArgs),
    /// Chess960 utilities
    #[command(name = "chess960")]
    Chess960(chess960::Chess960Args),
    /// FEN utilities
    Fen(fen::FenArgs),
    /// PGN utilities
    Pgn(pgn::PgnArgs),
    /// Play chess against the built-in engine
    Play(play::PlayArgs),
    /// Set up a Chess960 position
    Setup(setup::SetupArgs),
    /// Lichess tools and API
    Lichess(lichess::LichessArgs),
    /// Chess.com API tools
    #[command(name = "com")]
    Com(com::ComArgs),
}

pub fn run(args: &ChessArgs) -> Result<()> {
    match &args.command {
        ChessCommand::Elo(a) => elo::run(a),
        ChessCommand::Chess960(a) => chess960::run(a),
        ChessCommand::Fen(a) => fen::run(a),
        ChessCommand::Pgn(a) => pgn::run(a),
        ChessCommand::Play(a) => play::run(a),
        ChessCommand::Setup(a) => setup::run(a),
        ChessCommand::Lichess(a) => lichess::run(a),
        ChessCommand::Com(a) => com::run(a),
    }
}
