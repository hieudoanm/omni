//! Chess960 position validator.
use anyhow::{anyhow, Result};
use clap::Args;
use serde_json::json;
use std::collections::HashMap;

#[derive(Args)]
pub struct ValidateArgs {
    /// The 8-character back-rank position (e.g. BBQNNRKR)
    pub position: String,
    /// Output in JSON format
    #[arg(long, short = 'j', global = true)]
    pub json: bool,
}

pub fn run(args: &ValidateArgs) -> Result<()> {
    let pos = args.position.to_uppercase();
    if pos.chars().count() != 8 {
        return Err(anyhow!(
            "position must be exactly 8 characters, got {}",
            pos.chars().count()
        ));
    }
    let mut counts: HashMap<char, usize> = HashMap::new();
    for ch in pos.chars() {
        *counts.entry(ch).or_default() += 1;
    }
    for (piece, want, name) in [
        ('K', 1, "king"),
        ('Q', 1, "queen"),
        ('R', 2, "rooks"),
        ('B', 2, "bishops"),
        ('N', 2, "knights"),
    ] {
        let got = counts.get(&piece).copied().unwrap_or(0);
        if got != want {
            return Err(anyhow!("must have exactly {want} {name}, got {got}"));
        }
    }
    let bishop_positions: Vec<usize> = pos
        .char_indices()
        .filter(|(_, c)| *c == 'B')
        .map(|(i, _)| i)
        .collect();
    if bishop_positions[0] % 2 == bishop_positions[1] % 2 {
        return Err(anyhow!("bishops must be on opposite-colored squares"));
    }
    let king_pos = pos.find('K').unwrap_or(0) as i64;
    let rook_positions: Vec<i64> = pos
        .char_indices()
        .filter(|(_, c)| *c == 'R')
        .map(|(i, _)| i as i64)
        .collect();
    let (r1, r2) = (rook_positions[0], rook_positions[1]);
    if !(r1 < king_pos && king_pos < r2) {
        return Err(anyhow!("king must be between the two rooks"));
    }
    if args.json {
        println!(
            "{}",
            serde_json::to_string_pretty(&json!({"position": pos, "valid": true}))?
        );
    } else {
        println!("✓ {pos} is a valid Chess960 position");
    }
    Ok(())
}
