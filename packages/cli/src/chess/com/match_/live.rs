use super::super::internal as com;
use anyhow::{anyhow, Result};
use clap::Args;

#[derive(Args)]
pub struct LiveArgs {
    /// Match ID
    #[arg(long)]
    pub id: String,
    /// Output in JSON format
    #[arg(long, short = 'j', global = true)]
    pub json: bool,
}

pub fn run(args: &LiveArgs) -> Result<()> {
    let url = format!("{}/match/live/{}", com::BASE, args.id);
    let body = com::get(&url).map_err(|e| anyhow!("failed to fetch match: {e}"))?;
    let m: serde_json::Value =
        serde_json::from_slice(&body).map_err(|e| anyhow!("failed to parse match: {e}"))?;
    if args.json {
        return com::print_json(&m);
    }
    println!();
    println!("Live Match: {}", com::s(&m["name"]));
    println!("{}", "-".repeat(50));
    println!("Status : {}", com::s(&m["status"]));
    println!("Boards : {}", com::i(&m["boards"]));
    println!(
        "Team 1 : {} ({:.1})",
        com::s(&m["teams"]["team1"]["name"]),
        m["teams"]["team1"]["score"].as_f64().unwrap_or(0.0)
    );
    println!(
        "Team 2 : {} ({:.1})",
        com::s(&m["teams"]["team2"]["name"]),
        m["teams"]["team2"]["score"].as_f64().unwrap_or(0.0)
    );
    Ok(())
}
