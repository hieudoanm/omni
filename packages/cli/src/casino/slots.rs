use anyhow::Result;
use clap::Args;
use rand::Rng;

const SLOTS_SYMBOLS: [&str; 6] = ["🍒", "🍋", "🔔", "💎", "7️⃣", "BAR"];
const SLOTS_PAYOUTS: [i32; 6] = [2, 3, 5, 10, 20, 50];

#[derive(Args)]
pub struct SlotsArgs {
    #[command(subcommand)]
    pub command: Option<SlotsCommand>,
}

#[derive(clap::Subcommand)]
pub enum SlotsCommand {
    /// Play a slot machine
    Play(PlayArgs),
}

#[derive(Args)]
pub struct PlayArgs {
    /// Bet amount per spin
    #[arg(long, short = 'b', default_value_t = 25)]
    pub bet: i32,
    /// Number of spins
    #[arg(long, short = 'n', default_value_t = 1)]
    pub spins: usize,
}

#[derive(serde::Serialize)]
struct SpinResult {
    reels: [String; 3],
    win: i32,
    balance: i32,
}

pub fn run(args: &SlotsArgs, json: bool) -> Result<()> {
    match &args.command {
        Some(SlotsCommand::Play(a)) => run_play(a, json),
        None => {
            println!("Slot machine games\n");
            println!("Usage:\n  omni casino slots [command]\n");
            println!("Available Commands:");
            println!("  play  Play a slot machine");
            Ok(())
        }
    }
}

fn run_play(args: &PlayArgs, json: bool) -> Result<()> {
    let mut rng = rand::rng();
    let mut balance = 1000i32;
    let mut results = Vec::new();
    for _ in 0..args.spins {
        let reels = [
            rng.random_range(0..SLOTS_SYMBOLS.len()),
            rng.random_range(0..SLOTS_SYMBOLS.len()),
            rng.random_range(0..SLOTS_SYMBOLS.len()),
        ];
        let win = if reels[0] == reels[1] && reels[1] == reels[2] {
            args.bet * SLOTS_PAYOUTS[reels[0]]
        } else {
            0
        };
        balance += win;
        results.push(SpinResult {
            reels: [
                SLOTS_SYMBOLS[reels[0]].to_string(),
                SLOTS_SYMBOLS[reels[1]].to_string(),
                SLOTS_SYMBOLS[reels[2]].to_string(),
            ],
            win,
            balance,
        });
    }
    if json {
        println!(
            "{}",
            serde_json::to_string_pretty(&serde_json::json!({
                "spins": results, "bet": args.bet,
            }))?
        );
    } else {
        for (i, sr) in results.iter().enumerate() {
            let line = format!("{} {} {}", sr.reels[0], sr.reels[1], sr.reels[2]);
            if args.spins == 1 {
                println!("🎰 {line}");
                if sr.win > 0 {
                    println!("  You won ${}!", sr.win);
                } else {
                    println!("  No win. Try again.");
                }
                println!("  Balance: ${}", sr.balance);
            } else {
                let result = if sr.win > 0 {
                    format!("Win ${}", sr.win)
                } else {
                    "No win".to_string()
                };
                println!("  {:2}. {}  ({})", i + 1, line, result);
            }
        }
    }
    Ok(())
}
