pub mod play;
pub mod rules;
pub mod strategy;

use anyhow::Result;
use clap::{Args, Subcommand};

#[derive(Args)]
pub struct BaccaratArgs {
    #[command(subcommand)]
    pub command: Option<BaccaratCommand>,
}

#[derive(Subcommand)]
pub enum BaccaratCommand {
    /// Play a game of Baccarat
    Play(play::PlayArgs),
    /// Baccarat strategy analysis and statistics
    Strategy(strategy::StrategyArgs),
}

pub fn run(args: &BaccaratArgs, json: bool) -> Result<()> {
    match &args.command {
        Some(BaccaratCommand::Play(a)) => play::run(a, json),
        Some(BaccaratCommand::Strategy(a)) => strategy::run(a, json),
        None => {
            println!("Baccarat subcommands: play a game, or analyze betting strategy.\n");
            println!("Usage:\n  omni casino baccarat [command]\n");
            println!("Available Commands:");
            println!("  play      Play a game of Baccarat");
            println!("  strategy  Baccarat strategy analysis and statistics");
            Ok(())
        }
    }
}
