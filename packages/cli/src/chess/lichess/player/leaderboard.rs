//! Top-N players for a perf type.
use crate::chess::lichess::client;
use anyhow::{anyhow, Result};
use clap::Args;
use serde_json::Value;

#[derive(Args)]
pub struct LeaderboardArgs {
    /// Performance type (bullet, blitz, ...)
    pub perf_type: String,
    /// Number of players
    pub count: Option<String>,
    /// Output in JSON format
    #[arg(long, short = 'j', global = true)]
    pub json: bool,
}

pub fn run(args: &LeaderboardArgs) -> Result<()> {
    let nb = args.count.clone().unwrap_or_else(|| "10".to_string());
    let body = client::do_get(
        &format!(
            "/player/top/{}/{}",
            client::url_encode(&nb),
            client::url_encode(&args.perf_type)
        ),
        &[],
    )
    .map_err(|e| anyhow!("failed to fetch leaderboard: {e}"))?;
    let board: Value =
        serde_json::from_slice(&body).map_err(|e| anyhow!("failed to parse leaderboard: {e}"))?;
    if args.json {
        println!("{}", serde_json::to_string_pretty(&board)?);
        return Ok(());
    }
    let users = board["users"].as_array().cloned().unwrap_or_default();
    println!("\n♞ Lichess {} Top {}", args.perf_type, users.len());
    println!("{}", "-".repeat(48));
    for (i, u) in users.iter().enumerate() {
        let title = u["title"].as_str().unwrap_or("");
        let title = if title.is_empty() {
            String::new()
        } else {
            format!(" {title}")
        };
        let online = if u["online"].as_bool().unwrap_or(false) {
            " ●"
        } else {
            ""
        };
        println!(
            "  {:>2}. {}{} ({}){}",
            i + 1,
            u["username"].as_str().unwrap_or(""),
            title,
            u["rating"].as_i64().unwrap_or(0),
            online
        );
    }
    Ok(())
}
