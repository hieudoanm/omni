//! Top 10 players across all perf types.
use crate::chess::lichess::client;
use anyhow::{anyhow, Result};
use clap::Args;
use serde_json::Value;

#[derive(Args)]
pub struct Top10Args {
    /// Output in JSON format
    #[arg(long, short = 'j', global = true)]
    pub json: bool,
}

const PERFS: &[(&str, &str)] = &[
    ("Bullet", "bullet"),
    ("Blitz", "blitz"),
    ("Rapid", "rapid"),
    ("Classical", "classical"),
    ("UltraBullet", "ultraBullet"),
    ("Crazyhouse", "crazyhouse"),
    ("Chess960", "chess960"),
    ("King of the Hill", "kingOfTheHill"),
    ("Three Check", "threeCheck"),
    ("Antichess", "antichess"),
    ("Atomic", "atomic"),
    ("Horde", "horde"),
    ("Racing Kings", "racingKings"),
];

pub fn run(args: &Top10Args) -> Result<()> {
    let body =
        client::do_get("/player", &[]).map_err(|e| anyhow!("failed to fetch top players: {e}"))?;
    let data: Value =
        serde_json::from_slice(&body).map_err(|e| anyhow!("failed to parse top players: {e}"))?;
    if args.json {
        println!("{}", serde_json::to_string_pretty(&data)?);
        return Ok(());
    }
    println!("\n♞ Lichess Top 10");
    println!("{}", "-".repeat(48));
    for (name, key) in PERFS {
        let users = data[*key].as_array().cloned().unwrap_or_default();
        if users
            .first()
            .and_then(|u| u["username"].as_str())
            .unwrap_or("")
            .is_empty()
        {
            continue;
        }
        println!("\n{name}:");
        for (i, u) in users.iter().enumerate() {
            if u["username"].as_str().unwrap_or("").is_empty() {
                break;
            }
            let title = u["title"].as_str().unwrap_or("");
            let title = if title.is_empty() {
                String::new()
            } else {
                format!(" {title}")
            };
            let prog = {
                let p = u["progress"].as_i64().unwrap_or(0);
                if p > 0 {
                    format!(" ▲{p}")
                } else if p < 0 {
                    format!(" ▼{}", -p)
                } else {
                    String::new()
                }
            };
            let online = if u["online"].as_bool().unwrap_or(false) {
                " ●"
            } else {
                ""
            };
            println!(
                "  {:>2}. {}{} ({}){}{}",
                i + 1,
                u["username"].as_str().unwrap_or(""),
                title,
                u["rating"].as_i64().unwrap_or(0),
                prog,
                online
            );
        }
    }
    Ok(())
}
