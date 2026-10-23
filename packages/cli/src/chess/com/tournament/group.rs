use super::super::internal as com;
use anyhow::{anyhow, Result};
use clap::Args;

#[derive(Args)]
pub struct GroupArgs {
    /// Tournament URL ID
    #[arg(long, short = 't')]
    pub tournament: String,
    /// Round number
    #[arg(long, short = 'r')]
    pub round: i64,
    /// Group number
    #[arg(long, short = 'g')]
    pub group: i64,
    /// Output in JSON format
    #[arg(long, short = 'j', global = true)]
    pub json: bool,
}

pub fn run(args: &GroupArgs) -> Result<()> {
    let url = format!(
        "{}/tournament/{}/{}/{}",
        com::BASE,
        args.tournament,
        args.round,
        args.group
    );
    let body = com::get(&url).map_err(|e| anyhow!("failed to fetch group: {e}"))?;
    let g: serde_json::Value =
        serde_json::from_slice(&body).map_err(|e| anyhow!("failed to parse group: {e}"))?;
    if args.json {
        return com::print_json(&g);
    }
    println!(
        "Group {} (round {}): {} games, {} players",
        args.group,
        args.round,
        g["games"].as_array().map(|a| a.len()).unwrap_or(0),
        g["players"].as_array().map(|a| a.len()).unwrap_or(0)
    );
    Ok(())
}
