use super::super::internal as com;
use anyhow::{anyhow, Result};
use clap::Args;

#[derive(Args)]
pub struct MatchesArgs {
    /// Club URL ID
    #[arg(long, short = 'c')]
    pub club: String,
    /// Output in JSON format
    #[arg(long, short = 'j', global = true)]
    pub json: bool,
}

pub fn run(args: &MatchesArgs) -> Result<()> {
    let url = format!("{}/club/{}/matches", com::BASE, args.club);
    let body = com::get(&url).map_err(|e| anyhow!("failed to fetch matches: {e}"))?;
    let resp: serde_json::Value =
        serde_json::from_slice(&body).map_err(|e| anyhow!("failed to parse matches: {e}"))?;
    if args.json {
        return com::print_json(&resp);
    }
    println!();
    for key in ["registered", "in_progress", "finished"] {
        let n = resp[key].as_array().map(|a| a.len()).unwrap_or(0);
        if n > 0 {
            println!("{}: {n}", key.replace('_', " "));
        }
    }
    Ok(())
}
