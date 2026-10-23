pub mod cheatsheet;
pub mod count;
pub mod play;

use anyhow::Result;
use clap::{Args, Subcommand};

#[derive(Args)]
pub struct BlackjackArgs {
    #[command(subcommand)]
    pub command: Option<BlackjackCommand>,
}

#[derive(Subcommand)]
pub enum BlackjackCommand {
    /// Display basic blackjack strategy
    Cheatsheet(cheatsheet::CheatsheetArgs),
    /// Practice Hi-Lo card counting
    Count(count::CountArgs),
    /// Play a full game of Blackjack against the dealer
    Play(play::PlayArgs),
}

pub fn run(args: &BlackjackArgs, json: bool) -> Result<()> {
    match &args.command {
        Some(BlackjackCommand::Cheatsheet(a)) => cheatsheet::run(a, json),
        Some(BlackjackCommand::Count(a)) => count::run(a, json),
        Some(BlackjackCommand::Play(a)) => play::run(a, json),
        None => {
            println!("Blackjack games\n");
            println!("Usage:\n  omni casino blackjack [command]\n");
            println!("Available Commands:");
            println!("  cheatsheet  Display basic blackjack strategy");
            println!("  count       Practice Hi-Lo card counting");
            println!("  play        Play a full game of Blackjack against the dealer");
            Ok(())
        }
    }
}
