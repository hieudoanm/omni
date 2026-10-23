//! Masters opening explorer.
use crate::chess::lichess::client;
use anyhow::{anyhow, Result};
use clap::Args;
use serde_json::Value;

#[derive(Args)]
pub struct OpeningArgs {
    /// FEN position
    pub fen: String,
    /// Output in JSON format
    #[arg(long, short = 'j', global = true)]
    pub json: bool,
}

pub fn run(args: &OpeningArgs) -> Result<()> {
    let body = client::do_get(
        "https://explorer.lichess.org/masters",
        &[("fen", args.fen.clone())],
    )
    .map_err(|e| anyhow!("failed to fetch opening stats: {e}"))?;
    let stats: Value =
        serde_json::from_slice(&body).map_err(|e| anyhow!("failed to parse opening stats: {e}"))?;
    if args.json {
        println!("{}", serde_json::to_string_pretty(&stats)?);
        return Ok(());
    }
    println!("\n♞ Masters Opening Explorer");
    println!("{}", "-".repeat(48));
    if let Some(o) = stats["opening"].as_object() {
        let name = o["name"].as_str().unwrap_or("");
        if !name.is_empty() {
            println!("Opening : {} ({})", name, o["eco"].as_str().unwrap_or(""));
        }
    }
    let white = stats["white"].as_i64().unwrap_or(0);
    let draws = stats["draws"].as_i64().unwrap_or(0);
    let black = stats["black"].as_i64().unwrap_or(0);
    let total = white + draws + black;
    println!("Games   : {total}");
    println!(
        "Results : {white}W / {draws}D / {black}B ({:.1}% / {:.1}% / {:.1}%)",
        white as f64 / total as f64 * 100.0,
        draws as f64 / total as f64 * 100.0,
        black as f64 / total as f64 * 100.0
    );
    println!();
    println!(
        "{:<8} {:<10} {:<10} {:<6}",
        "Move", "White", "Draw", "Black"
    );
    println!("-------- ---------- ---------- ------");
    if let Some(moves) = stats["moves"].as_array() {
        for m in moves {
            let (w, d, b) = (
                m["white"].as_i64().unwrap_or(0),
                m["draws"].as_i64().unwrap_or(0),
                m["black"].as_i64().unwrap_or(0),
            );
            if w == 0 && b == 0 {
                continue;
            }
            let mt = w + d + b;
            println!(
                "{:<8} {:>5}({:>4.1}%) {:>5}({:>4.1}%) {:>5}({:>4.1}%)",
                m["san"].as_str().unwrap_or(""),
                w,
                w as f64 / mt as f64 * 100.0,
                d,
                d as f64 / mt as f64 * 100.0,
                b,
                b as f64 / mt as f64 * 100.0,
            );
        }
    }
    Ok(())
}
