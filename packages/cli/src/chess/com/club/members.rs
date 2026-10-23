use super::super::internal as com;
use anyhow::{anyhow, Result};
use clap::Args;

#[derive(Args)]
pub struct MembersArgs {
    /// Club URL ID
    #[arg(long, short = 'c')]
    pub club: String,
    /// Output in JSON format
    #[arg(long, short = 'j', global = true)]
    pub json: bool,
}

pub fn run(args: &MembersArgs) -> Result<()> {
    let url = format!("{}/club/{}/members", com::BASE, args.club);
    let body = com::get(&url).map_err(|e| anyhow!("failed to fetch members: {e}"))?;
    let resp: serde_json::Value =
        serde_json::from_slice(&body).map_err(|e| anyhow!("failed to parse members: {e}"))?;
    if args.json {
        return com::print_json(&resp);
    }
    println!();
    println!(
        "Weekly  : {} members",
        resp["weekly"].as_array().map(|a| a.len()).unwrap_or(0)
    );
    println!(
        "Monthly : {} members",
        resp["monthly"].as_array().map(|a| a.len()).unwrap_or(0)
    );
    println!(
        "All time: {} members",
        resp["all_time"].as_array().map(|a| a.len()).unwrap_or(0)
    );
    Ok(())
}
