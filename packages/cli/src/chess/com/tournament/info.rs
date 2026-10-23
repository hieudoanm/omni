use super::super::internal as com;
use anyhow::{anyhow, Result};
use clap::Args;

#[derive(Args)]
pub struct InfoArgs {
    /// Tournament URL ID
    #[arg(long, short = 't')]
    pub tournament: String,
    /// Output in JSON format
    #[arg(long, short = 'j', global = true)]
    pub json: bool,
}

pub fn run(args: &InfoArgs) -> Result<()> {
    let url = format!("{}/tournament/{}", com::BASE, args.tournament);
    let body = com::get(&url).map_err(|e| anyhow!("failed to fetch tournament: {e}"))?;
    let info: serde_json::Value =
        serde_json::from_slice(&body).map_err(|e| anyhow!("failed to parse tournament: {e}"))?;
    if args.json {
        return com::print_json(&info);
    }
    println!();
    println!("Tournament: {}", com::s(&info["name"]));
    println!("{}", "-".repeat(50));
    println!("Status : {}", com::s(&info["status"]));
    println!("Type   : {}", com::s(&info["settings"]["type"]));
    println!(
        "Time   : {} {}",
        com::s(&info["settings"]["time_class"]),
        com::s(&info["settings"]["time_control"])
    );
    println!(
        "Players: {}",
        info["players"].as_array().map(|a| a.len()).unwrap_or(0)
    );
    println!(
        "Rounds : {}",
        info["rounds"].as_array().map(|a| a.len()).unwrap_or(0)
    );
    Ok(())
}
