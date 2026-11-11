use super::super::internal as com;
use anyhow::{anyhow, Result};
use clap::Args;

#[derive(Args)]
pub struct PlayersArgs {
    /// ISO 3166-1 alpha-2 country code
    #[arg(long, short = 'c')]
    pub code: String,
    /// Output in JSON format
    #[arg(long, short = 'j', global = true)]
    pub json: bool,
}

pub fn run(args: &PlayersArgs) -> Result<()> {
    let url = format!("{}/country/{}/players", com::BASE, args.code.to_uppercase());
    let body = com::get(&url).map_err(|e| anyhow!("failed to fetch players: {e}"))?;
    let resp: serde_json::Value =
        serde_json::from_slice(&body).map_err(|e| anyhow!("failed to parse players: {e}"))?;
    if args.json {
        return com::print_json(&resp);
    }
    let players = resp["players"].as_array().cloned().unwrap_or_default();
    if players.is_empty() {
        println!("No players found");
        return Ok(());
    }
    println!();
    for p in &players {
        println!("{}", p.as_str().unwrap_or(""));
    }
    Ok(())
}
