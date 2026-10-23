use super::super::internal as com;
use anyhow::{anyhow, Result};
use clap::Args;

#[derive(Args)]
pub struct MatchesArgs {
    /// Chess.com username
    #[arg(long, short = 'u')]
    pub username: String,
    /// Output in JSON format
    #[arg(long, short = 'j', global = true)]
    pub json: bool,
}

pub fn run(args: &MatchesArgs) -> Result<()> {
    let url = format!(
        "{}/player/{}/matches",
        com::BASE,
        args.username.to_lowercase()
    );
    let body = com::get(&url).map_err(|e| anyhow!("failed to fetch matches: {e}"))?;
    let resp: serde_json::Value =
        serde_json::from_slice(&body).map_err(|e| anyhow!("failed to parse matches: {e}"))?;
    if args.json {
        return com::print_json(&resp);
    }
    println!("\nMatches for {}:", args.username);
    for section in ["in_progress", "registered", "finished"] {
        let label = match section {
            "in_progress" => "In progress",
            "registered" => "Registered",
            _ => "Finished",
        };
        let list = resp[section].as_array().cloned().unwrap_or_default();
        if !list.is_empty() {
            println!("\n{label}:");
            for m in &list {
                println!("  {}", com::s(&m["name"]));
            }
        }
    }
    Ok(())
}
