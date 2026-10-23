use super::super::internal as com;
use anyhow::{anyhow, Result};
use clap::Args;

#[derive(Args)]
pub struct StatsArgs {
    /// Chess.com username
    #[arg(long, short = 'u')]
    pub username: String,
    /// Output in JSON format
    #[arg(long, short = 'j', global = true)]
    pub json: bool,
}

pub fn run(args: &StatsArgs) -> Result<()> {
    let url = format!(
        "{}/player/{}/stats",
        com::BASE,
        args.username.to_lowercase()
    );
    let body = com::get(&url).map_err(|e| anyhow!("failed to fetch stats: {e}"))?;
    let raw: serde_json::Value =
        serde_json::from_slice(&body).map_err(|e| anyhow!("failed to parse stats: {e}"))?;
    if args.json {
        return com::print_json(&raw);
    }
    let game_types = [
        "chess_bullet",
        "chess_blitz",
        "chess_rapid",
        "chess_daily",
        "chess960_daily",
    ];
    println!("\nRatings\n");
    println!(
        "| {:<14} | {:>8} | {:>8} | {:>8} | {:>8} | {:>8} |",
        "Game Type", "Rating", "Best", "Win", "Draw", "Loss"
    );
    println!(
        "| {} | {} | {} | {} | {} | {} |",
        "-".repeat(14),
        "-".repeat(8),
        "-".repeat(8),
        "-".repeat(8),
        "-".repeat(8),
        "-".repeat(8)
    );
    for gt in game_types {
        if let Some(gs) = raw.get(gt) {
            println!(
                "| {:<14} | {:>8} | {:>8} | {:>8} | {:>8} | {:>8} |",
                gt,
                com::i(&gs["last"]["rating"]),
                com::i(&gs["best"]["rating"]),
                crate::chess::internal::comma(com::i(&gs["record"]["win"])),
                crate::chess::internal::comma(com::i(&gs["record"]["draw"])),
                crate::chess::internal::comma(com::i(&gs["record"]["loss"]))
            );
        }
    }
    if let Some(t) = raw.get("tactics") {
        println!(
            "\nTactics  : best {}, lowest {}",
            com::i(&t["highest"]["rating"]),
            com::i(&t["lowest"]["rating"])
        );
    }
    if let Some(p) = raw.get("puzzle_rush") {
        println!(
            "\nPuzzle Rush: best {}, daily best {}",
            com::i(&p["best"]["score"]),
            com::i(&p["daily"]["score"])
        );
    }
    Ok(())
}
