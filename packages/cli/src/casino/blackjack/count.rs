use anyhow::Result;
use clap::Args;
use rand::seq::SliceRandom;
use serde::Serialize;

#[derive(Args)]
pub struct CountArgs {
    /// Number of cards to deal
    #[arg(long, short = 'n', default_value_t = 13)]
    pub cards: usize,
}

#[derive(Clone, Copy)]
struct CountCard {
    rank: &'static str,
    value: i32,
}

fn hi_lo_count_value(rank: &str) -> i32 {
    match rank {
        "2" | "3" | "4" | "5" | "6" => 1,
        "7" | "8" | "9" => 0,
        _ => -1,
    }
}

fn new_count_deck() -> Vec<CountCard> {
    const RANKS: [&str; 13] = [
        "A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K",
    ];
    let mut deck: Vec<CountCard> = RANKS
        .iter()
        .map(|&r| CountCard {
            rank: r,
            value: hi_lo_count_value(r),
        })
        .collect();
    deck.shuffle(&mut rand::rng());
    deck
}

#[derive(Serialize)]
struct CardResult {
    rank: &'static str,
    value: i32,
}

pub fn run(args: &CountArgs, json: bool) -> Result<()> {
    let deck = new_count_deck();
    let mut count = 0i32;
    let limit = args.cards.min(deck.len());
    let mut card_results = Vec::with_capacity(limit);
    for c in deck.iter().take(limit) {
        let c = *c;
        count += c.value;
        card_results.push(CardResult {
            rank: c.rank,
            value: c.value,
        });
    }
    if json {
        println!(
            "{}",
            serde_json::to_string_pretty(&serde_json::json!({
                "cards": card_results, "final_count": count,
            }))?
        );
    } else {
        for (i, cr) in card_results.iter().enumerate() {
            println!(
                "Card {:2}/{:}: {}  (running count: {:+})",
                i + 1,
                limit,
                cr.rank,
                cr.value
            );
        }
        println!("\nFinal running count: {count:+}");
    }
    Ok(())
}
