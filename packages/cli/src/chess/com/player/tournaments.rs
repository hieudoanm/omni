use super::super::internal as com;
use anyhow::{anyhow, Result};
use clap::Args;

#[derive(Args)]
pub struct TournamentsArgs {
    /// Chess.com username
    #[arg(long, short = 'u')]
    pub username: String,
    /// Output in JSON format
    #[arg(long, short = 'j', global = true)]
    pub json: bool,
}

pub fn run(args: &TournamentsArgs) -> Result<()> {
    let url = format!(
        "{}/player/{}/tournaments",
        com::BASE,
        args.username.to_lowercase()
    );
    let body = com::get(&url).map_err(|e| anyhow!("failed to fetch tournaments: {e}"))?;
    let resp: serde_json::Value =
        serde_json::from_slice(&body).map_err(|e| anyhow!("failed to parse tournaments: {e}"))?;
    if args.json {
        return com::print_json(&resp);
    }
    println!("\nTournaments for {}:", args.username);
    for section in ["in_progress", "registered"] {
        let label = if section == "in_progress" {
            "In progress"
        } else {
            "Registered"
        };
        let list = resp[section].as_array().cloned().unwrap_or_default();
        if !list.is_empty() {
            println!("\n{label}:");
            for t in &list {
                println!("  {}", com::s(&t["@id"]));
            }
        }
    }
    let finished = resp["finished"].as_array().cloned().unwrap_or_default();
    if !finished.is_empty() {
        println!("\nFinished:");
        for t in &finished {
            println!(
                "  {} (placement: {}/{})",
                com::s(&t["@id"]),
                com::i(&t["placement"]),
                com::i(&t["total_players"])
            );
        }
    }
    Ok(())
}
