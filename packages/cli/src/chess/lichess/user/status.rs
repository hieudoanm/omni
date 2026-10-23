//! User online/playing status.
use crate::chess::lichess::client;
use anyhow::{anyhow, Result};
use clap::Args;
use serde_json::Value;

#[derive(Args)]
pub struct StatusArgs {
    /// Lichess usernames (space separated)
    pub usernames: Vec<String>,
    /// Output in JSON format
    #[arg(long, short = 'j', global = true)]
    pub json: bool,
}

pub fn run(args: &StatusArgs) -> Result<()> {
    let ids = args.usernames.join(",");
    let body = client::do_get("/users/status", &[("ids", client::url_encode(&ids))])
        .map_err(|e| anyhow!("failed to fetch status: {e}"))?;
    let statuses: Value =
        serde_json::from_slice(&body).map_err(|e| anyhow!("failed to parse status: {e}"))?;
    if args.json {
        println!("{}", serde_json::to_string_pretty(&statuses)?);
        return Ok(());
    }
    println!("\n♞ User Status");
    println!("{}", "-".repeat(48));
    if let Some(list) = statuses.as_array() {
        for s in list {
            let title = s["title"].as_str().unwrap_or("");
            let title = if title.is_empty() {
                String::new()
            } else {
                format!(" ({title})")
            };
            let online = if s["playing"].as_bool().unwrap_or(false) {
                "playing"
            } else if s["online"].as_bool().unwrap_or(false) {
                "online"
            } else {
                "offline"
            };
            println!(
                "  {}{}  {}",
                s["name"].as_str().unwrap_or(""),
                title,
                online
            );
        }
    }
    Ok(())
}
