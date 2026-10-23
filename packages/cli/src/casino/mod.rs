pub mod baccarat;
pub mod blackjack;
pub mod coin;
pub mod dice;
pub mod internal;
pub mod poker;
pub mod roulette;
pub mod slots;

use anyhow::Result;
use clap::{Args, Subcommand};

#[derive(Args)]
pub struct CasinoArgs {
    #[command(subcommand)]
    pub command: Option<CasinoCommand>,
    /// Output in JSON format
    #[arg(long, short = 'j', global = true)]
    pub json: bool,
}

#[derive(Subcommand)]
pub enum CasinoCommand {
    /// Blackjack games
    Blackjack(blackjack::BlackjackArgs),
    /// Poker: odds calculator and Texas Hold'em
    Poker(poker::PokerArgs),
    /// Baccarat games
    Baccarat(baccarat::BaccaratArgs),
    /// Slot machine games
    Slots(slots::SlotsArgs),
    /// Flip a coin
    Coin(coin::CoinArgs),
    /// Roll dice
    Dice(dice::DiceArgs),
    /// Spin the roulette wheel
    Roulette(roulette::RouletteArgs),
}

pub fn run(args: &CasinoArgs) -> Result<()> {
    let json = args.json;
    match &args.command {
        Some(CasinoCommand::Blackjack(a)) => blackjack::run(a, json),
        Some(CasinoCommand::Poker(a)) => poker::run(a, json),
        Some(CasinoCommand::Baccarat(a)) => baccarat::run(a, json),
        Some(CasinoCommand::Slots(a)) => slots::run(a, json),
        Some(CasinoCommand::Coin(a)) => coin::run(a, json),
        Some(CasinoCommand::Dice(a)) => dice::run(a, json),
        Some(CasinoCommand::Roulette(a)) => roulette::run(a, json),
        None => {
            println!("Casino games: blackjack, poker odds, and more\n");
            println!("Usage:\n  omni casino [command]\n");
            println!("Available Commands:");
            println!("  baccarat   Baccarat games");
            println!("  blackjack  Blackjack games");
            println!("  coin       Flip a coin");
            println!("  dice       Roll dice");
            println!("  poker      Poker: odds calculator and Texas Hold'em");
            println!("  roulette   Spin the roulette wheel");
            println!("  slots      Slot machine games");
            Ok(())
        }
    }
}
