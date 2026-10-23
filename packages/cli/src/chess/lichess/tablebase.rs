//! Syzygy tablebase lookup.
use crate::chess::lichess::client;
use anyhow::{anyhow, Result};
use clap::Args;
use serde_json::Value;

#[derive(Args)]
pub struct TablebaseArgs {
    /// FEN position
    pub fen: String,
    /// Output in JSON format
    #[arg(long, short = 'j', global = true)]
    pub json: bool,
}

pub fn run(args: &TablebaseArgs) -> Result<()> {
    let body = client::do_get(
        "https://tablebase.lichess.org/standard",
        &[("fen", args.fen.clone())],
    )
    .map_err(|e| anyhow!("failed to fetch tablebase: {e}"))?;
    let tb: Value =
        serde_json::from_slice(&body).map_err(|e| anyhow!("failed to parse tablebase: {e}"))?;
    if args.json {
        println!("{}", serde_json::to_string_pretty(&tb)?);
        return Ok(());
    }
    println!("\n♞ Syzygy Tablebase");
    println!("{}", "-".repeat(48));
    println!("Category: {}", tb["category"].as_str().unwrap_or(""));
    if tb["checkmate"].as_bool().unwrap_or(false) {
        println!("Result  : Checkmate");
    } else if tb["stalemate"].as_bool().unwrap_or(false) {
        println!("Result  : Stalemate");
    }
    println!("\nTop moves:");
    if let Some(moves) = tb["moves"].as_array() {
        for m in moves.iter().take(10) {
            let dtm = m["dtm"]
                .as_i64()
                .map(|d| format!(" (DTM: {d})"))
                .unwrap_or_default();
            println!(
                "  {} ({}){}",
                m["san"].as_str().unwrap_or(""),
                m["category"].as_str().unwrap_or(""),
                dtm
            );
        }
    }
    Ok(())
}
