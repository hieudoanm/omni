use super::super::internal as com;
use anyhow::{anyhow, Result};
use clap::Args;

#[derive(Args)]
pub struct ToMoveArgs {
    /// Chess.com username
    #[arg(long, short = 'u')]
    pub username: String,
    /// Output in JSON format
    #[arg(long, short = 'j', global = true)]
    pub json: bool,
}

pub fn run(args: &ToMoveArgs) -> Result<()> {
    let url = format!(
        "{}/player/{}/games/to-move",
        com::BASE,
        args.username.to_lowercase()
    );
    let body = com::get(&url).map_err(|e| anyhow!("failed to fetch to-move games: {e}"))?;
    let resp: serde_json::Value =
        serde_json::from_slice(&body).map_err(|e| anyhow!("failed to parse response: {e}"))?;
    if args.json {
        return com::print_json(&resp);
    }
    let games = resp["games"].as_array().cloned().unwrap_or_default();
    if games.is_empty() {
        println!("No games to move");
        return Ok(());
    }
    println!("{} games to move", games.len());
    Ok(())
}
