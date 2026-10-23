use super::super::internal as com;
use anyhow::{anyhow, Result};
use clap::Args;

#[derive(Args)]
pub struct LiveArgs {
    /// Chess.com username
    #[arg(long, short = 'u')]
    pub username: String,
    /// Base time in seconds
    #[arg(long, short = 'b')]
    pub base: i64,
    /// Increment in seconds
    #[arg(long, short = 'i')]
    pub increment: i64,
    /// Output in JSON format
    #[arg(long, short = 'j', global = true)]
    pub json: bool,
}

pub fn run(args: &LiveArgs) -> Result<()> {
    let url = format!(
        "{}/player/{}/games/live/{}/{}",
        com::BASE,
        args.username.to_lowercase(),
        args.base,
        args.increment
    );
    let body = com::get(&url).map_err(|e| anyhow!("failed to fetch live games: {e}"))?;
    let resp: serde_json::Value =
        serde_json::from_slice(&body).map_err(|e| anyhow!("failed to parse live games: {e}"))?;
    if args.json {
        return com::print_json(&resp);
    }
    let games = resp["games"].as_array().cloned().unwrap_or_default();
    if games.is_empty() {
        println!("No games found");
        return Ok(());
    }
    println!(
        "Live games for {} ({}+{}):",
        args.username, args.base, args.increment
    );
    for g in &games {
        println!(
            "  {} ({}) vs {} ({}) | {} | {}",
            com::s(&g["white"]["username"]),
            com::i(&g["white"]["rating"]),
            com::s(&g["black"]["username"]),
            com::i(&g["black"]["rating"]),
            g["rated"].as_bool().unwrap_or(false),
            com::s(&g["time_class"])
        );
    }
    Ok(())
}
