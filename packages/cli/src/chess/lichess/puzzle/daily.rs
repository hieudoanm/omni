//! Daily puzzle.
use crate::chess::lichess::client;
use anyhow::{anyhow, Result};
use clap::Args;
use serde_json::Value;

#[derive(Args)]
pub struct DailyArgs {
    /// Output in JSON format
    #[arg(long, short = 'j', global = true)]
    pub json: bool,
}

pub fn run(args: &DailyArgs) -> Result<()> {
    let body = client::do_get("/puzzle/daily", &[])
        .map_err(|e| anyhow!("failed to fetch daily puzzle: {e}"))?;
    let data: Value =
        serde_json::from_slice(&body).map_err(|e| anyhow!("failed to parse puzzle: {e}"))?;
    if args.json {
        println!("{}", serde_json::to_string_pretty(&data)?);
        return Ok(());
    }
    let p = &data["puzzle"];
    println!("\n♞ Lichess Daily Puzzle");
    println!("{}", "-".repeat(48));
    println!("Puzzle  : {}", p["id"].as_str().unwrap_or(""));
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
    let g = &data["game"];
    println!();
    println!(
        "Game    : {} ({} {})",
        g["id"].as_str().unwrap_or(""),
        g["perf"]["name"].as_str().unwrap_or(""),
        if g["rated"].as_bool().unwrap_or(false) {
            "rated"
        } else {
            "casual"
        }
    );
    if let Some(players) = g["players"].as_array() {
        for pl in players {
            let title = pl["title"].as_str().unwrap_or("");
            let title = if title.is_empty() {
                String::new()
            } else {
                format!(" {title}")
            };
            println!(
                "  {}: {}{} ({})",
                pl["color"].as_str().unwrap_or(""),
                pl["name"].as_str().unwrap_or(""),
                title,
                pl["rating"].as_i64().unwrap_or(0)
            );
        }
    }
    Ok(())
}
