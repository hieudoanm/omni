//! Lichess TV channels.
use crate::chess::lichess::client;
use anyhow::{anyhow, Result};
use clap::Args;
use serde_json::Value;

#[derive(Args)]
pub struct TvArgs {
    /// Output in JSON format
    #[arg(long, short = 'j', global = true)]
    pub json: bool,
}

const CHANNELS: &[(&str, &str)] = &[
    ("Bullet", "bullet"),
    ("Blitz", "blitz"),
    ("Rapid", "rapid"),
    ("Classical", "classical"),
    ("UltraBullet", "ultraBullet"),
    ("Crazyhouse", "crazyhouse"),
    ("Chess960", "chess960"),
    ("King Of The Hill", "kingOfTheHill"),
    ("Three Check", "threeCheck"),
    ("Antichess", "antichess"),
    ("Atomic", "atomic"),
    ("Horde", "horde"),
    ("Racing Kings", "racingKings"),
];

pub fn run(args: &TvArgs) -> Result<()> {
    let body = client::do_get("/tv/channels", &[])
        .map_err(|e| anyhow!("failed to fetch TV channels: {e}"))?;
    let ch: Value =
        serde_json::from_slice(&body).map_err(|e| anyhow!("failed to parse TV channels: {e}"))?;
    if args.json {
        println!("{}", serde_json::to_string_pretty(&ch)?);
        return Ok(());
    }
    println!("\n♞ Lichess TV");
    println!("{}", "-".repeat(48));
    for (name, key) in CHANNELS {
        let g = &ch[*key];
        let title = g["user"]["title"].as_str().unwrap_or("");
        let title = if title.is_empty() {
            String::new()
        } else {
            format!(" {title}")
        };
        println!(
            "  {:<16} {}{} ({})  game: {}",
            format!("{name}:"),
            g["user"]["name"].as_str().unwrap_or(""),
            title,
            g["rating"].as_i64().unwrap_or(0),
            g["gameId"].as_str().unwrap_or("")
        );
    }
    Ok(())
}
