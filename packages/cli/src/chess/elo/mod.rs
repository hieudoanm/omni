//! Elo rating calculators (ported from cli.go chess/elo).
pub mod change;
pub mod diff;
pub mod expected;
pub mod internal;
pub mod required;
pub mod tournament;
pub mod tpr;

use anyhow::Result;
use clap::{Args, Subcommand};

#[derive(Args)]
pub struct EloArgs {
    #[command(subcommand)]
    pub command: EloCommand,
}

#[derive(Subcommand)]
pub enum EloCommand {
    /// Calculate expected score between two players
    #[command(name = "expected-score")]
    Expected(expected::ExpectedArgs),
    /// Calculate rating change after a game
    #[command(name = "rating-change")]
    Change(change::ChangeArgs),
    /// Calculate total rating change across multiple games
    Tournament(tournament::TournamentArgs),
    /// Calculate tournament performance rating
    Tpr(tpr::TprArgs),
    /// Calculate score needed for a target performance rating
    #[command(name = "required-score")]
    Required(required::RequiredArgs),
    /// Convert between rating difference and expected score
    #[command(name = "rating-diff")]
    Diff(diff::DiffArgs),
}

pub fn run(args: &EloArgs) -> Result<()> {
    match &args.command {
        EloCommand::Expected(a) => expected::run(a),
        EloCommand::Change(a) => change::run(a),
        EloCommand::Tournament(a) => tournament::run(a),
        EloCommand::Tpr(a) => tpr::run(a),
        EloCommand::Required(a) => required::run(a),
        EloCommand::Diff(a) => diff::run(a),
    }
}
