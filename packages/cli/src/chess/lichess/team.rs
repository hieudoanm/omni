//! Team info lookup.
use crate::chess::lichess::client;
use anyhow::{anyhow, Result};
use clap::Args;
use serde_json::Value;

#[derive(Args)]
pub struct TeamArgs {
    /// Team ID
    pub team_id: String,
    /// Output in JSON format
    #[arg(long, short = 'j', global = true)]
    pub json: bool,
}

pub fn run(args: &TeamArgs) -> Result<()> {
    let body = client::do_get(&format!("/team/{}", args.team_id), &[])
        .map_err(|e| anyhow!("failed to fetch team: {e}"))?;
    let t: Value =
        serde_json::from_slice(&body).map_err(|e| anyhow!("failed to parse team: {e}"))?;
    if args.json {
        println!("{}", serde_json::to_string_pretty(&t)?);
        return Ok(());
    }
    println!("\n♞ {}", t["name"].as_str().unwrap_or(""));
    println!("{}", "-".repeat(48));
    println!("ID      : {}", t["id"].as_str().unwrap_or(""));
    println!("Members : {}", t["nbMembers"].as_i64().unwrap_or(0));
    println!("Open    : {}", t["open"].as_bool().unwrap_or(false));
    let leader = &t["leader"];
    if !leader["name"].as_str().unwrap_or("").is_empty() {
        let title = leader["title"].as_str().unwrap_or("");
        let title = if title.is_empty() {
            String::new()
        } else {
            format!(" {title}")
        };
        println!(
            "Leader  : {}{}",
            leader["name"].as_str().unwrap_or(""),
            title
        );
    }
    if let Some(desc) = t["description"].as_str().filter(|s| !s.is_empty()) {
        let desc = if desc.chars().count() > 200 {
            format!("{}...", desc.chars().take(200).collect::<String>())
        } else {
            desc.to_string()
        };
        println!("About   : {desc}");
    }
    Ok(())
}
