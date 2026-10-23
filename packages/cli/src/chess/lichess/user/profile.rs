//! User profile lookup.
use crate::chess::lichess::client;
use anyhow::{anyhow, Result};
use clap::Args;
use serde_json::Value;

#[derive(Args)]
pub struct ProfileArgs {
    /// Lichess username
    pub username: String,
    /// Output in JSON format
    #[arg(long, short = 'j', global = true)]
    pub json: bool,
}

pub fn run(args: &ProfileArgs) -> Result<()> {
    let body = client::do_get(
        &format!(
            "/user/{}",
            crate::chess::lichess::client::url_encode(&args.username)
        ),
        &[],
    )
    .map_err(|e| anyhow!("failed to fetch user: {e}"))?;
    let u: Value =
        serde_json::from_slice(&body).map_err(|e| anyhow!("failed to parse user: {e}"))?;
    if args.json {
        println!("{}", serde_json::to_string_pretty(&u)?);
        return Ok(());
    }
    let username = u["username"].as_str().unwrap_or("");
    let title = u["title"].as_str().unwrap_or("");
    println!("\n♞ {username}");
    if !title.is_empty() {
        print!(" ({title})");
    }
    println!("\n{}", "-".repeat(48));
    let prof = &u["profile"];
    if prof.is_object() {
        let name = format!(
            "{} {}",
            prof["firstName"].as_str().unwrap_or(""),
            prof["lastName"].as_str().unwrap_or("")
        );
        if !name.trim().is_empty() {
            println!("Name     : {}", name.trim());
        }
        if let Some(loc) = prof["location"].as_str().filter(|s| !s.is_empty()) {
            println!("Location : {loc}");
        }
        if let Some(c) = prof["country"].as_str().filter(|s| !s.is_empty()) {
            println!("Country  : {c}");
        }
    }
    println!("Patron   : {}", u["patron"].as_bool().unwrap_or(false));
    if let Some(pt) = u["playTime"].as_object() {
        println!(
            "PlayTime : {}h total, {}h TV",
            pt["total"].as_i64().unwrap_or(0) / 3600,
            pt["tv"].as_i64().unwrap_or(0) / 3600
        );
    }
    println!("\nRatings:");
    if let Some(perfs) = u["perfs"].as_object() {
        let mut keys: Vec<_> = perfs.keys().collect();
        keys.sort();
        for perf in keys {
            let p = &perfs[perf];
            let prov = if p["prov"].as_bool().unwrap_or(false) {
                "?"
            } else {
                ""
            };
            println!(
                "  {:<16} {}{}",
                format!("{perf}:"),
                p["rating"].as_i64().unwrap_or(0),
                prov
            );
        }
    }
    if let Some(count) = u["count"].as_object() {
        println!();
        println!(
            "Games    : {} total, {} rated",
            count["all"].as_i64().unwrap_or(0),
            count["rated"].as_i64().unwrap_or(0)
        );
        println!(
            "Record   : {}W/{}L/{}D",
            count["win"].as_i64().unwrap_or(0),
            count["loss"].as_i64().unwrap_or(0),
            count["draw"].as_i64().unwrap_or(0)
        );
    }
    Ok(())
}
