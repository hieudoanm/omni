//! Tournament details.
use crate::chess::lichess::client;
use anyhow::{anyhow, Result};
use clap::Args;
use serde_json::Value;

#[derive(Args)]
pub struct InfoArgs {
    /// Tournament ID
    pub tournament_id: String,
    /// Output in JSON format
    #[arg(long, short = 'j', global = true)]
    pub json: bool,
}

pub fn run(args: &InfoArgs) -> Result<()> {
    let body = client::do_get(&format!("/tournament/{}", args.tournament_id), &[])
        .map_err(|e| anyhow!("failed to fetch tournament: {e}"))?;
    let t: Value =
        serde_json::from_slice(&body).map_err(|e| anyhow!("failed to parse tournament: {e}"))?;
    if args.json {
        println!("{}", serde_json::to_string_pretty(&t)?);
        return Ok(());
    }
    println!("\n♞ {}", t["fullName"].as_str().unwrap_or(""));
    println!("{}", "-".repeat(48));
    if t["perf"].is_object() {
        println!(
            "Type    : {} ({})",
            t["perf"]["name"].as_str().unwrap_or(""),
            t["system"].as_str().unwrap_or("")
        );
    }
    println!(
        "Clock   : {}+{}",
        t["clock"]["limit"].as_i64().unwrap_or(0),
        t["clock"]["increment"].as_i64().unwrap_or(0)
    );
    println!("Players : {}", t["nbPlayers"].as_i64().unwrap_or(0));
    if t["isFinished"].as_bool().unwrap_or(false) {
        println!("Status  : finished");
    } else if t["secondsToStart"].as_i64().unwrap_or(0) > 0 {
        println!(
            "Starts  : in {}s",
            t["secondsToStart"].as_i64().unwrap_or(0)
        );
    } else {
        println!(
            "Finishes: in {}s",
            t["secondsToFinish"].as_i64().unwrap_or(0)
        );
    }
    if let Some(d) = t["description"].as_str().filter(|s| !s.is_empty()) {
        println!("Info    : {d}");
    }
    if let Some(st) = t["stats"].as_object() {
        println!("\nStats:");
        println!("  Games   : {}", st["games"].as_i64().unwrap_or(0));
        println!("  Moves   : {}", st["moves"].as_i64().unwrap_or(0));
        println!(
            "  Result  : {}W / {}B / {}D",
            st["whiteWins"].as_i64().unwrap_or(0),
            st["blackWins"].as_i64().unwrap_or(0),
            st["draws"].as_i64().unwrap_or(0)
        );
        println!("  Avg     : {}", st["averageRating"].as_i64().unwrap_or(0));
    }
    if let Some(standing) = t["standing"]["players"].as_array() {
        if !standing.is_empty() {
            println!("\nStanding (top {}):", standing.len());
            for p in standing {
                let title = p["title"].as_str().unwrap_or("");
                let title = if title.is_empty() {
                    String::new()
                } else {
                    format!(" {title}")
                };
                println!(
                    "  #{}  {}{} ({})  score: {}",
                    p["rank"].as_i64().unwrap_or(0),
                    p["name"].as_str().unwrap_or(""),
                    title,
                    p["rating"].as_i64().unwrap_or(0),
                    p["score"].as_i64().unwrap_or(0)
                );
            }
        }
    }
    Ok(())
}
