//! Chess960 utilities (ported from cli.go chess/chess960).
pub mod positions;
pub mod random;
pub mod validate;

use anyhow::Result;
use clap::{Args, Subcommand};

#[derive(Args)]
pub struct Chess960Args {
    #[command(subcommand)]
    pub command: Chess960Command,
}

#[derive(Subcommand)]
pub enum Chess960Command {
    /// Pick a random Chess960 starting position
    Random(random::RandomArgs),
    /// Validate a Chess960 starting position
    Validate(validate::ValidateArgs),
}

pub fn run(args: &Chess960Args) -> Result<()> {
    match &args.command {
        Chess960Command::Random(a) => random::run(a),
        Chess960Command::Validate(a) => validate::run(a),
    }
}
