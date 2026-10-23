//! Head-to-head statistics between two users.
use crate::chess::lichess::client;
use anyhow::{anyhow, Result};
use clap::Args;
use serde_json::Value;

#[derive(Args)]
pub struct CrosstableArgs {
    /// First username
    pub user1: String,
    /// Second username
    pub user2: String,
    /// Output in JSON format
    #[arg(long, short = 'j', global = true)]
    pub json: bool,
}

pub fn run(args: &CrosstableArgs) -> Result<()> {
    let body = client::do_get(
        &format!(
            "/crosstable/{}/{}",
            client::url_encode(&args.user1),
            client::url_encode(&args.user2)
        ),
        &[],
    )
    .map_err(|e| anyhow!("failed to fetch crosstable: {e}"))?;
    let ct: Value =
        serde_json::from_slice(&body).map_err(|e| anyhow!("failed to parse crosstable: {e}"))?;
    if args.json {
        println!("{}", serde_json::to_string_pretty(&ct)?);
        return Ok(());
    }
    println!("\n♞ {} vs {}", args.user1, args.user2);
    println!("{}", "-".repeat(48));
    println!("Games   : {}", ct["nbGames"].as_i64().unwrap_or(0));
    if let Some(users) = ct["users"].as_object() {
        let mut keys: Vec<_> = users.keys().collect();
        keys.sort();
        for name in keys {
            println!("  {}: {:.1}", name, users[name].as_f64().unwrap_or(0.0));
        }
    }
    Ok(())
}
