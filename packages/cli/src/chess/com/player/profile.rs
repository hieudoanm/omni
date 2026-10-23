use super::super::internal as com;
use anyhow::{anyhow, Result};
use clap::Args;

#[derive(Args)]
pub struct ProfileArgs {
    /// Chess.com username
    #[arg(long, short = 'u')]
    pub username: String,
    /// Output in JSON format
    #[arg(long, short = 'j', global = true)]
    pub json: bool,
}

pub fn run(args: &ProfileArgs) -> Result<()> {
    let url = format!("{}/player/{}", com::BASE, args.username.to_lowercase());
    let body = com::get(&url).map_err(|e| anyhow!("failed to fetch profile: {e}"))?;
    let profile: serde_json::Value =
        serde_json::from_slice(&body).map_err(|e| anyhow!("failed to parse profile: {e}"))?;
    if args.json {
        return com::print_json(&profile);
    }
    println!();
    println!("Player: {}", com::s(&profile["username"]).to_uppercase());
    println!("{}", "-".repeat(50));
    let name = com::s(&profile["name"]);
    if !name.is_empty() {
        println!("Name     : {name}");
    }
    let title = com::s(&profile["title"]);
    if !title.is_empty() {
        println!("Title    : {title}");
    }
    println!("Status   : {}", com::s(&profile["status"]));
    let loc = com::s(&profile["location"]);
    if !loc.is_empty() {
        println!("Location : {loc}");
    }
    println!("Followers: {}", com::i(&profile["followers"]));
    if com::i(&profile["fide"]) > 0 {
        println!("FIDE     : {}", com::i(&profile["fide"]));
    }
    if profile["is_streamer"].as_bool().unwrap_or(false) {
        println!("Streamer : {}", com::s(&profile["twitch_url"]));
    }
    Ok(())
}
