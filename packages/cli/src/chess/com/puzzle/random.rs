use super::super::internal as com;
use anyhow::{anyhow, Result};
use clap::Args;

#[derive(Args)]
pub struct RandomArgs {
    /// Output in JSON format
    #[arg(long, short = 'j', global = true)]
    pub json: bool,
}

pub fn run(args: &RandomArgs) -> Result<()> {
    let body = com::get(&format!("{}/puzzle/random", com::BASE))
        .map_err(|e| anyhow!("failed to fetch puzzle: {e}"))?;
    let puzzle: serde_json::Value =
        serde_json::from_slice(&body).map_err(|e| anyhow!("failed to parse puzzle: {e}"))?;
    if args.json {
        return com::print_json(&puzzle);
    }
    println!();
    println!("Title: {}", com::s(&puzzle["title"]));
    println!("URL  : {}", com::s(&puzzle["url"]));
    println!("FEN  : {}", com::s(&puzzle["fen"]));
    Ok(())
}
