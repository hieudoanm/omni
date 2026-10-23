use super::internal as com;
use anyhow::{anyhow, Result};
use clap::Args;

#[derive(Args)]
pub struct StreamerArgs {
    /// Output in JSON format
    #[arg(long, short = 'j', global = true)]
    pub json: bool,
}

pub fn run(args: &StreamerArgs) -> Result<()> {
    let body = com::get(&format!("{}/streamers", com::BASE))
        .map_err(|e| anyhow!("failed to fetch streamers: {e}"))?;
    let resp: serde_json::Value =
        serde_json::from_slice(&body).map_err(|e| anyhow!("failed to parse streamers: {e}"))?;
    if args.json {
        return com::print_json(&resp);
    }
    let list = resp["streamers"].as_array().cloned().unwrap_or_default();
    if list.is_empty() {
        println!("No streamers found");
        return Ok(());
    }
    println!();
    for s in &list {
        println!(
            "  {} | {}",
            com::s(&s["username"]),
            com::s(&s["twitch_url"])
        );
    }
    Ok(())
}
