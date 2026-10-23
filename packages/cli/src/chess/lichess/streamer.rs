//! Live streamers list.
use crate::chess::lichess::client;
use anyhow::{anyhow, Result};
use clap::Args;
use serde_json::Value;

#[derive(Args)]
pub struct StreamerArgs {
    /// Output in JSON format
    #[arg(long, short = 'j', global = true)]
    pub json: bool,
}

pub fn run(args: &StreamerArgs) -> Result<()> {
    let body = client::do_get("/streamer/live", &[])
        .map_err(|e| anyhow!("failed to fetch live streamers: {e}"))?;
    let streamers: Value =
        serde_json::from_slice(&body).map_err(|e| anyhow!("failed to parse streamers: {e}"))?;
    if args.json {
        println!("{}", serde_json::to_string_pretty(&streamers)?);
        return Ok(());
    }
    println!("\n♞ Live Streamers");
    println!("{}", "-".repeat(48));
    if let Some(list) = streamers.as_array() {
        for s in list {
            let title = s["title"].as_str().unwrap_or("");
            let title = if title.is_empty() {
                String::new()
            } else {
                format!(" ({title})")
            };
            let stream_info = if let Some(st) = s["stream"].as_object() {
                format!(
                    " [{}] {}",
                    st["service"].as_str().unwrap_or(""),
                    st["status"].as_str().unwrap_or("")
                )
            } else {
                String::new()
            };
            println!(
                "  {}{}{}",
                s["name"].as_str().unwrap_or(""),
                title,
                stream_info
            );
        }
        if list.is_empty() {
            println!("  No live streamers right now.");
        }
    }
    Ok(())
}
