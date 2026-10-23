use super::hand;
use crate::casino::internal::{parse_card, Card};
use anyhow::{anyhow, Result};
use clap::Args;
use rand::seq::SliceRandom;
use serde::Serialize;
use std::collections::HashSet;

#[derive(Args)]
pub struct OddsArgs {
    /// Hole cards (e.g. "Ah Kh")
    #[arg(long, short = 'H', default_value = "")]
    pub hand: String,
    /// Community cards (e.g. "2h 7s Tc")
    #[arg(long, short = 'b', default_value = "")]
    pub board: String,
    /// Number of opponents
    #[arg(long, short = 'o', default_value_t = 1)]
    pub opponents: usize,
    /// Number of Monte Carlo simulations
    #[arg(long, short = 'n', default_value_t = 10000)]
    pub simulations: usize,
}

#[derive(Serialize)]
struct OddsJson {
    hand: Vec<String>,
    board: Vec<String>,
    opponents: usize,
    simulations: usize,
    win: f64,
    tie: f64,
    lose: f64,
}

fn format_cards(s: &str) -> Result<Vec<Card>> {
    let mut cards = Vec::new();
    for p in s.split_whitespace() {
        if p.len() < 2 {
            return Err(anyhow!("invalid card: {p:?}"));
        }
        cards.push(parse_card(p)?);
    }
    cards.sort();
    Ok(cards)
}

fn new_poker_deck() -> Vec<Card> {
    let mut deck = Vec::with_capacity(52);
    for rank in 2..=14 {
        for suit in [
            crate::casino::internal::Suit::Clubs,
            crate::casino::internal::Suit::Diamonds,
            crate::casino::internal::Suit::Hearts,
            crate::casino::internal::Suit::Spades,
        ] {
            deck.push(Card { rank, suit });
        }
    }
    deck
}

fn remove_cards(deck: &[Card], remove: &HashSet<Card>) -> Vec<Card> {
    deck.iter()
        .copied()
        .filter(|c| !remove.contains(c))
        .collect()
}

#[derive(Default)]
struct OddsResult {
    win: f64,
    tie: f64,
    lose: f64,
}

fn calculate_odds(
    hole: &[Card],
    board: &[Card],
    num_opponents: usize,
    simulations: usize,
) -> OddsResult {
    let mut seen = HashSet::new();
    seen.extend(hole.iter().copied());
    seen.extend(board.iter().copied());
    let deck = remove_cards(&new_poker_deck(), &seen);

    let (mut wins, mut ties) = (0usize, 0usize);
    let mut rng = rand::rng();
    for _ in 0..simulations {
        let mut d = deck.clone();
        d.shuffle(&mut rng);
        let mut i = 0usize;
        let mut full_board = board.to_vec();
        while full_board.len() < 5 {
            full_board.push(d[i]);
            i += 1;
        }
        let mut hero = hole.to_vec();
        hero.extend_from_slice(&full_board);
        let hero_result = hand::best_hand(&hero);

        let mut best = hero_result;
        let mut best_count = 1usize;
        for _ in 0..num_opponents {
            let opp = [d[i], d[i + 1]];
            i += 2;
            let mut opp_cards = opp.to_vec();
            opp_cards.extend_from_slice(&full_board);
            let r = hand::best_hand(&opp_cards);
            match hand::compare(&r, &best) {
                std::cmp::Ordering::Greater => {
                    best = r;
                    best_count = 1;
                }
                std::cmp::Ordering::Equal => best_count += 1,
                _ => {}
            }
        }
        if hand::compare(&hero_result, &best) == std::cmp::Ordering::Equal {
            if best_count > 1 {
                ties += 1;
            } else {
                wins += 1;
            }
        }
    }
    let total = simulations as f64;
    OddsResult {
        win: wins as f64 / total * 100.0,
        tie: ties as f64 / total * 100.0,
        lose: 100.0 - (wins + ties) as f64 / total * 100.0,
    }
}

pub fn run(args: &OddsArgs, json: bool) -> Result<()> {
    let hole = format_cards(&args.hand)?;
    if hole.len() != 2 {
        return Err(anyhow!("exactly 2 hole cards required, got {}", hole.len()));
    }
    let board = if args.board.is_empty() {
        Vec::new()
    } else {
        let b = format_cards(&args.board)?;
        if b.len() > 5 {
            return Err(anyhow!("board can have at most 5 cards, got {}", b.len()));
        }
        b
    };

    let mut seen = HashSet::new();
    for c in hole.iter().chain(board.iter()) {
        if !seen.insert(*c) {
            return Err(anyhow!("duplicate card: {c}"));
        }
    }

    let result = calculate_odds(&hole, &board, args.opponents, args.simulations);
    if json {
        println!(
            "{}",
            serde_json::to_string_pretty(&OddsJson {
                hand: vec![hole[0].to_string(), hole[1].to_string()],
                board: board.iter().map(|c| c.to_string()).collect(),
                opponents: args.opponents,
                simulations: args.simulations,
                win: result.win,
                tie: result.tie,
                lose: result.lose,
            })?
        );
    } else {
        println!("{}", "─".repeat(48));
        println!("  Your hand:      {} {}", hole[0], hole[1]);
        if !board.is_empty() {
            let b_str: Vec<String> = board.iter().map(|c| c.to_string()).collect();
            println!("  Board:          {}", b_str.join(" "));
        }
        println!("  Opponents:      {}", args.opponents);
        println!("  Simulations:    {}", args.simulations);
        println!("{}", "─".repeat(48));
        println!("  Win:   {:5.1}%", result.win);
        println!("  Tie:   {:5.1}%", result.tie);
        println!("  Lose:  {:5.1}%", result.lose);
        println!("{}", "─".repeat(48));
    }
    Ok(())
}
