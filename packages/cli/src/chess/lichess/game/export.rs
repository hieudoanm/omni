//! Game export by ID.
use crate::chess::lichess::client;
use anyhow::{anyhow, Result};
use clap::Args;
use serde_json::Value;

#[derive(Args)]
pub struct ExportArgs {
    /// Game ID
    pub game_id: String,
    /// Output in JSON format
    #[arg(long, short = 'j', global = true)]
    pub json: bool,
}

pub fn run(args: &ExportArgs) -> Result<()> {
    let body = client::do_get(
        &format!("/game/export/{}", args.game_id),
        &[("pgnInJson", "true".to_string())],
    )
    .map_err(|e| anyhow!("failed to fetch game: {e}"))?;
    let game: Value =
        serde_json::from_slice(&body).map_err(|e| anyhow!("failed to parse game: {e}"))?;
    if args.json {
        println!("{}", serde_json::to_string_pretty(&game)?);
        return Ok(());
    }
    println!("\n♞ Game {}", game["id"].as_str().unwrap_or(""));
    println!("{}", "-".repeat(48));
    println!(
        "Variant : {} ({})",
        game["variant"].as_str().unwrap_or(""),
        game["speed"].as_str().unwrap_or("")
    );
    println!("Status  : {}", game["status"].as_str().unwrap_or(""));
    if game["rated"].as_bool().unwrap_or(false) {
        println!("Rated   : yes");
    }
    let white = &game["players"]["white"];
    let black = &game["players"]["black"];
    let w_name = white["user"]["name"]
        .as_str()
        .or_else(|| white["name"].as_str())
        .unwrap_or("");
    let b_name = black["user"]["name"]
        .as_str()
        .or_else(|| black["name"].as_str())
        .unwrap_or("");
    println!(
        "White   : {w_name} ({})",
        white["rating"].as_i64().unwrap_or(0)
    );
    println!(
        "Black   : {b_name} ({})",
        black["rating"].as_i64().unwrap_or(0)
    );
    if let Some(w) = game["winner"].as_str().filter(|s| !s.is_empty()) {
        println!("Winner  : {w}");
    }
    if let Some(o) = game["opening"].as_object() {
        println!(
            "Opening : {} ({})",
            o["name"].as_str().unwrap_or(""),
            o["eco"].as_str().unwrap_or("")
        );
    }
    if let Some(c) = game["clock"].as_object() {
        println!(
            "Clock   : {}+{}",
            c["limit"].as_i64().unwrap_or(0),
            c["increment"].as_i64().unwrap_or(0)
        );
    }
    Ok(())
}
