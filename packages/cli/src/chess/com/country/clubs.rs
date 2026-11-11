use super::super::internal as com;
use anyhow::{anyhow, Result};
use clap::Args;

#[derive(Args)]
pub struct ClubsArgs {
    /// ISO 3166-1 alpha-2 country code
    #[arg(long, short = 'c')]
    pub code: String,
    /// Output in JSON format
    #[arg(long, short = 'j', global = true)]
    pub json: bool,
}

pub fn run(args: &ClubsArgs) -> Result<()> {
    let url = format!("{}/country/{}/clubs", com::BASE, args.code.to_uppercase());
    let body = com::get(&url).map_err(|e| anyhow!("failed to fetch clubs: {e}"))?;
    let resp: serde_json::Value =
        serde_json::from_slice(&body).map_err(|e| anyhow!("failed to parse clubs: {e}"))?;
    if args.json {
        return com::print_json(&resp);
    }
    let clubs = resp["clubs"].as_array().cloned().unwrap_or_default();
    if clubs.is_empty() {
        println!("No clubs found");
        return Ok(());
    }
    println!();
    for c in &clubs {
        println!("{}", c.as_str().unwrap_or(""));
    }
    Ok(())
}
