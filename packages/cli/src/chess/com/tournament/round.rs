use super::super::internal as com;
use anyhow::{anyhow, Result};
use clap::Args;

#[derive(Args)]
pub struct RoundArgs {
    /// Tournament URL ID
    #[arg(long, short = 't')]
    pub tournament: String,
    /// Round number
    #[arg(long, short = 'r')]
    pub round: i64,
    /// Output in JSON format
    #[arg(long, short = 'j', global = true)]
    pub json: bool,
}

pub fn run(args: &RoundArgs) -> Result<()> {
    let url = format!(
        "{}/tournament/{}/{}",
        com::BASE,
        args.tournament,
        args.round
    );
    let body = com::get(&url).map_err(|e| anyhow!("failed to fetch round: {e}"))?;
    let r: serde_json::Value =
        serde_json::from_slice(&body).map_err(|e| anyhow!("failed to parse round: {e}"))?;
    if args.json {
        return com::print_json(&r);
    }
    println!(
        "Round {}: {} groups, {} players",
        args.round,
        r["groups"].as_array().map(|a| a.len()).unwrap_or(0),
        r["players"].as_array().map(|a| a.len()).unwrap_or(0)
    );
    Ok(())
}
