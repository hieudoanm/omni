use super::super::internal as com;
use anyhow::{anyhow, Result};
use clap::Args;

#[derive(Args)]
pub struct ProfileArgs {
    /// Club URL ID
    #[arg(long, short = 'c')]
    pub club: String,
    /// Output in JSON format
    #[arg(long, short = 'j', global = true)]
    pub json: bool,
}

pub fn run(args: &ProfileArgs) -> Result<()> {
    let url = format!("{}/club/{}", com::BASE, args.club);
    let body = com::get(&url).map_err(|e| anyhow!("failed to fetch club: {e}"))?;
    let profile: serde_json::Value =
        serde_json::from_slice(&body).map_err(|e| anyhow!("failed to parse club: {e}"))?;
    if args.json {
        return com::print_json(&profile);
    }
    println!("\nClub: {}", com::s(&profile["name"]));
    println!("{}", "-".repeat(50));
    println!("Members : {}", com::i(&profile["members_count"]));
    println!("Avg Rating: {}", com::i(&profile["average_daily_rating"]));
    println!("Visibility: {}", com::s(&profile["visibility"]));
    let desc = com::s(&profile["description"]);
    if !desc.is_empty() {
        println!("Desc    : {desc}");
    }
    Ok(())
}
