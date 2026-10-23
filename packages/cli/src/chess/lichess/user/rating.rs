//! User rating history.
use crate::chess::lichess::client;
use anyhow::{anyhow, Result};
use chrono::NaiveDate;
use clap::Args;
use serde_json::Value;

#[derive(Args)]
pub struct RatingArgs {
    /// Lichess username
    pub username: String,
    /// Output in JSON format
    #[arg(long, short = 'j', global = true)]
    pub json: bool,
}

pub fn run(args: &RatingArgs) -> Result<()> {
    let body = client::do_get(
        &format!(
            "/user/{}/rating-history",
            client::url_encode(&args.username)
        ),
        &[],
    )
    .map_err(|e| anyhow!("failed to fetch rating history: {e}"))?;
    let history: Value = serde_json::from_slice(&body)
        .map_err(|e| anyhow!("failed to parse rating history: {e}"))?;
    if args.json {
        println!("{}", serde_json::to_string_pretty(&history)?);
        return Ok(());
    }
    println!("\n♞ {} — Rating History", args.username);
    println!("{}", "-".repeat(48));
    if let Some(list) = history.as_array() {
        for entry in list {
            let points = entry["points"].as_array().cloned().unwrap_or_default();
            if points.is_empty() {
                continue;
            }
            let last = &points[points.len() - 1];
            let arr = last.as_array().cloned().unwrap_or_default();
            if arr.len() < 4 {
                continue;
            }
            let (y, m, d) = (
                arr[0].as_i64().unwrap_or(0),
                arr[1].as_i64().unwrap_or(0) + 1,
                arr[2].as_i64().unwrap_or(0),
            );
            let date = NaiveDate::from_ymd_opt(y as i32, m as u32, d as u32)
                .map(|d| d.format("%Y-%m-%d").to_string())
                .unwrap_or_default();
            println!(
                "  {:<16} {:>4} (last: {})",
                format!("{}:", entry["name"].as_str().unwrap_or("")),
                arr[3].as_i64().unwrap_or(0),
                date
            );
        }
    }
    Ok(())
}
