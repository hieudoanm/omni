pub mod hand;
pub mod odds;
pub mod play;

use anyhow::Result;
use clap::{Args, Subcommand};

#[derive(Args)]
pub struct PokerArgs {
    #[command(subcommand)]
    pub command: Option<PokerCommand>,
}

#[derive(Subcommand)]
pub enum PokerCommand {
    /// Calculate Texas Hold'em poker odds
    Odds(odds::OddsArgs),
    /// Play heads-up Texas Hold'em against an AI opponent
    Play(play::PlayArgs),
}

pub fn run(args: &PokerArgs, json: bool) -> Result<()> {
    match &args.command {
        Some(PokerCommand::Odds(a)) => odds::run(a, json),
        Some(PokerCommand::Play(a)) => play::run(a, json),
        None => {
            println!("Poker: odds calculator and Texas Hold'em\n");
            println!("Usage:\n  omni casino poker [command]\n");
            println!("Available Commands:");
            println!("  odds  Calculate Texas Hold'em poker odds");
            println!("  play  Play heads-up Texas Hold'em against an AI opponent");
            Ok(())
        }
    }
}
