use super::super::internal as com;
use anyhow::{anyhow, Result};
use clap::Args;

#[derive(Args)]
pub struct ArchiveArgs {
    /// Chess.com username
    #[arg(long, short = 'u')]
    pub username: String,
    /// Year (YYYY)
    #[arg(long, short = 'y')]
    pub year: String,
    /// Month (MM)
    #[arg(long, short = 'm')]
    pub month: String,
    /// Output in JSON format
    #[arg(long, short = 'j', global = true)]
    pub json: bool,
}

pub fn run(args: &ArchiveArgs) -> Result<()> {
    let url = format!(
        "{}/player/{}/games/{}/{}",
        com::BASE,
        args.username.to_lowercase(),
        args.year,
        args.month
    );
    let body = com::get(&url).map_err(|e| anyhow!("failed to fetch archive: {e}"))?;
    let resp: serde_json::Value =
        serde_json::from_slice(&body).map_err(|e| anyhow!("failed to parse archive: {e}"))?;
    if args.json {
        return com::print_json(&resp);
    }
    let games = resp["games"].as_array().cloned().unwrap_or_default();
    if games.is_empty() {
        println!("No games found");
        return Ok(());
    }
    println!(
        "Games from {}/{} for {}:",
        args.year, args.month, args.username
    );
    for g in &games {
        println!(
            "  {} ({}) vs {} ({}) | {} | {}",
            com::s(&g["white"]["username"]),
            com::i(&g["white"]["rating"]),
            com::s(&g["black"]["username"]),
            com::i(&g["black"]["rating"]),
            com::s(&g["time_control"]),
            com::s(&g["rules"])
        );
    }
    Ok(())
}
