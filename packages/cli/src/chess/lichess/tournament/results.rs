//! Tournament results (NDJSON stream).
use crate::chess::lichess::client;
use anyhow::{anyhow, Result};
use clap::Args;
use serde_json::Value;

#[derive(Args)]
pub struct ResultsArgs {
    /// Tournament ID
    pub tournament_id: String,
    /// Number of top results
    #[arg(long)]
    pub top: Option<i64>,
    /// Output in JSON format
    #[arg(long, short = 'j', global = true)]
    pub json: bool,
}

pub fn run(args: &ResultsArgs) -> Result<()> {
    let params: Vec<(&str, String)> = args
        .top
        .filter(|n| *n > 0)
        .map(|n| vec![("nb", n.to_string())])
        .unwrap_or_default();
    let body = client::do_get(
        &format!("/tournament/{}/results", args.tournament_id),
        &params,
    )
    .map_err(|e| anyhow!("failed to fetch tournament results: {e}"))?;
    let mut results: Vec<Value> = Vec::new();
    for line in String::from_utf8_lossy(&body).lines() {
        if line.is_empty() {
            continue;
        }
        if let Ok(r) = serde_json::from_str::<Value>(line) {
            results.push(r);
        }
    }
    if args.json {
        println!("{}", serde_json::to_string_pretty(&results)?);
        return Ok(());
    }
    println!("\n♞ Tournament Results ({})", results.len());
    println!("{}", "-".repeat(48));
    for r in &results {
        let title = r["title"].as_str().unwrap_or("");
        let title = if title.is_empty() {
            String::new()
        } else {
            format!(" {title}")
        };
        println!(
            "  #{}  {}{} ({})  score: {}  perf: {}",
            r["rank"].as_i64().unwrap_or(0),
            r["username"].as_str().unwrap_or(""),
            title,
            r["rating"].as_i64().unwrap_or(0),
            r["score"].as_i64().unwrap_or(0),
            r["performance"].as_i64().unwrap_or(0)
        );
    }
    Ok(())
}
