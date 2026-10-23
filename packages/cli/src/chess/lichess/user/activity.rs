//! Recent user activity (games/puzzles/tournaments).
use crate::chess::lichess::client;
use anyhow::{anyhow, Result};
use clap::Args;
use serde_json::Value;

#[derive(Args)]
pub struct ActivityArgs {
    /// Lichess username
    pub username: String,
    /// Output in JSON format
    #[arg(long, short = 'j', global = true)]
    pub json: bool,
}

pub fn run(args: &ActivityArgs) -> Result<()> {
    let body = client::do_get(
        &format!("/user/{}/activity", client::url_encode(&args.username)),
        &[],
    )
    .map_err(|e| anyhow!("failed to fetch activity: {e}"))?;
    let activities: Value =
        serde_json::from_slice(&body).map_err(|e| anyhow!("failed to parse activity: {e}"))?;
    if args.json {
        println!("{}", serde_json::to_string_pretty(&activities)?);
        return Ok(());
    }
    println!("\n♞ {} — Recent Activity", args.username);
    println!("{}", "-".repeat(48));
    if let Some(list) = activities.as_array() {
        for (i, a) in list.iter().take(10).enumerate() {
            println!("  Period {}:", i + 1);
            if let Some(games) = a["games"].as_object() {
                let mut keys: Vec<_> = games.keys().collect();
                keys.sort();
                for perf in keys {
                    let s = &games[perf];
                    let rp = s["rp"]["after"].as_i64().unwrap_or(0)
                        - s["rp"]["before"].as_i64().unwrap_or(0);
                    println!(
                        "    {}: {}W/{}L/{}D (rp: {rp:+})",
                        perf,
                        s["win"].as_i64().unwrap_or(0),
                        s["loss"].as_i64().unwrap_or(0),
                        s["draw"].as_i64().unwrap_or(0),
                    );
                }
            }
            if let Some(p) = a["puzzles"].as_object() {
                let s = &p["score"];
                println!(
                    "    puzzles: {}W/{}L/{}D",
                    s["win"].as_i64().unwrap_or(0),
                    s["loss"].as_i64().unwrap_or(0),
                    s["draw"].as_i64().unwrap_or(0)
                );
            }
            if let Some(t) = a["tournaments"].as_object() {
                println!("    tournaments: {} played", t["nb"].as_i64().unwrap_or(0));
                if let Some(best) = t["best"].as_array() {
                    for b in best {
                        println!(
                            "      best: {}  rank {}/{}  score {}",
                            b["tournament"]["name"].as_str().unwrap_or(""),
                            b["rank"].as_i64().unwrap_or(0),
                            b["rankPercent"].as_i64().unwrap_or(0),
                            b["score"].as_i64().unwrap_or(0)
                        );
                    }
                }
            }
        }
    }
    Ok(())
}
