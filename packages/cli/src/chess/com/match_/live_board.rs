use super::super::internal as com;
use anyhow::{anyhow, Result};
use clap::Args;

#[derive(Args)]
pub struct LiveBoardArgs {
    /// Match ID
    #[arg(long)]
    pub id: String,
    /// Board number
    #[arg(long, short = 'b')]
    pub board: i64,
    /// Output in JSON format
    #[arg(long, short = 'j', global = true)]
    pub json: bool,
}

pub fn run(args: &LiveBoardArgs) -> Result<()> {
    let url = format!("{}/match/live/{}/{}", com::BASE, args.id, args.board);
    let body = com::get(&url).map_err(|e| anyhow!("failed to fetch board: {e}"))?;
    let resp: serde_json::Value =
        serde_json::from_slice(&body).map_err(|e| anyhow!("failed to parse board: {e}"))?;
    if args.json {
        return com::print_json(&resp);
    }
    println!(
        "Live Board {}: {} games",
        args.board,
        resp["games"].as_array().map(|a| a.len()).unwrap_or(0)
    );
    Ok(())
}
