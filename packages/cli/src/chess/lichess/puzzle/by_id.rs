//! Puzzle lookup by ID.
use crate::chess::lichess::client;
use anyhow::{anyhow, Result};
use clap::Args;
use serde_json::Value;

#[derive(Args)]
pub struct ByIdArgs {
    /// Puzzle ID
    pub puzzle_id: String,
    /// Output in JSON format
    #[arg(long, short = 'j', global = true)]
    pub json: bool,
}

pub fn run(args: &ByIdArgs) -> Result<()> {
    let body = client::do_get(&format!("/puzzle/{}", args.puzzle_id), &[])
        .map_err(|e| anyhow!("failed to fetch puzzle: {e}"))?;
    let data: Value =
        serde_json::from_slice(&body).map_err(|e| anyhow!("failed to parse puzzle: {e}"))?;
    if args.json {
        println!("{}", serde_json::to_string_pretty(&data)?);
        return Ok(());
    }
    let p = &data["puzzle"];
    println!("\n♞ Puzzle {}", p["id"].as_str().unwrap_or(""));
    println!("{}", "-".repeat(48));
    println!(
        "Rating  : {} (played {} times)",
        p["rating"].as_i64().unwrap_or(0),
        p["plays"].as_i64().unwrap_or(0)
    );
    let themes = p["themes"]
        .as_array()
        .map(|a| {
            a.iter()
                .filter_map(|t| t.as_str())
                .collect::<Vec<_>>()
                .join(", ")
        })
        .unwrap_or_default();
    println!("Themes  : {themes}");
    println!("FEN     : {}", p["fen"].as_str().unwrap_or(""));
    let moves = p["solution"]
        .as_array()
        .map(|a| {
            a.iter()
                .filter_map(|t| t.as_str())
                .collect::<Vec<_>>()
                .join(", ")
        })
        .unwrap_or_default();
    println!("Moves   : {moves}");
    Ok(())
}
