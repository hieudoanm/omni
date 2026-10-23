use super::super::internal as com;
use anyhow::{anyhow, Result};
use clap::Args;

#[derive(Args)]
pub struct ClubsArgs {
    /// Chess.com username
    #[arg(long, short = 'u')]
    pub username: String,
    /// Output in JSON format
    #[arg(long, short = 'j', global = true)]
    pub json: bool,
}

pub fn run(args: &ClubsArgs) -> Result<()> {
    let url = format!(
        "{}/player/{}/clubs",
        com::BASE,
        args.username.to_lowercase()
    );
    let body = com::get(&url).map_err(|e| anyhow!("failed to fetch clubs: {e}"))?;
    let resp: serde_json::Value =
        serde_json::from_slice(&body).map_err(|e| anyhow!("failed to parse clubs: {e}"))?;
    if args.json {
        return com::print_json(&resp);
    }
    let clubs = resp["clubs"].as_array().cloned().unwrap_or_default();
    if clubs.is_empty() {
        println!("No clubs found");
        return Ok(());
    }
    println!();
    for c in &clubs {
        println!("  {}", com::s(&c["name"]));
    }
    Ok(())
}
