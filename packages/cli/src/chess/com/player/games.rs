use super::super::internal as com;
use anyhow::{anyhow, Result};
use clap::Args;

#[derive(Args)]
pub struct GamesArgs {
    /// Chess.com username
    #[arg(long, short = 'u')]
    pub username: String,
    /// Output in JSON format
    #[arg(long, short = 'j', global = true)]
    pub json: bool,
}

pub fn run(args: &GamesArgs) -> Result<()> {
    let url = format!(
        "{}/player/{}/games",
        com::BASE,
        args.username.to_lowercase()
    );
    let body = com::get(&url).map_err(|e| anyhow!("failed to fetch games: {e}"))?;
    let resp: serde_json::Value =
        serde_json::from_slice(&body).map_err(|e| anyhow!("failed to parse games: {e}"))?;
    if args.json {
        return com::print_json(&resp);
    }
    let games = resp["games"].as_array().cloned().unwrap_or_default();
    if games.is_empty() {
        println!("No current games");
        return Ok(());
    }
    println!("\nCurrent games for {}:\n", args.username);
    for g in &games {
        println!(
            "  {} vs {} | {} | {}",
            com::s(&g["white"]),
            com::s(&g["black"]),
            com::s(&g["time_class"]),
            com::s(&g["rules"])
        );
    }
    Ok(())
}
