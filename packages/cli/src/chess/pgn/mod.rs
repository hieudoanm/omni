//! PGN utilities (ported from cli.go chess/pgn).
pub mod fen;
pub mod uci;

use anyhow::Result;
use clap::{Args, Subcommand};

#[derive(Args)]
pub struct PgnArgs {
    #[command(subcommand)]
    pub command: PgnCommand,
}

#[derive(Subcommand)]
pub enum PgnCommand {
    /// Convert PGN to FEN per move with evaluation
    Fen(fen::FenArgs),
    /// Convert PGN moves to UCI notation
    Uci(uci::UciArgs),
}

pub fn run(args: &PgnArgs) -> Result<()> {
    match &args.command {
        PgnCommand::Fen(a) => fen::run(a),
        PgnCommand::Uci(a) => uci::run(a),
    }
}
