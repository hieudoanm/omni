//! Per-perf-type rating stats.
use crate::chess::lichess::client;
use anyhow::{anyhow, Result};
use clap::Args;
use serde_json::Value;

#[derive(Args)]
pub struct PerfArgs {
    /// Lichess username
    pub username: String,
    /// Performance type (blitz, rapid, ...)
    pub perf_type: String,
    /// Output in JSON format
    #[arg(long, short = 'j', global = true)]
    pub json: bool,
}

pub fn run(args: &PerfArgs) -> Result<()> {
    let body = client::do_get(
        &format!(
            "/user/{}/perf/{}",
            client::url_encode(&args.username),
            client::url_encode(&args.perf_type)
        ),
        &[],
    )
    .map_err(|e| anyhow!("failed to fetch perf stats: {e}"))?;
    let stat: Value =
        serde_json::from_slice(&body).map_err(|e| anyhow!("failed to parse perf stats: {e}"))?;
    if args.json {
        println!("{}", serde_json::to_string_pretty(&stat)?);
        return Ok(());
    }
    println!(
        "\n♞ {} — {}",
        stat["user"]["name"].as_str().unwrap_or(""),
        args.perf_type
    );
    println!("{}", "-".repeat(48));
    println!(
        "Rating    : {:.0} (dev: {:.1}, prov: {})",
        stat["perf"]["glicko"]["rating"].as_f64().unwrap_or(0.0),
        stat["perf"]["glicko"]["deviation"].as_f64().unwrap_or(0.0),
        stat["perf"]["glicko"]["provisional"]
            .as_bool()
            .unwrap_or(false)
    );
    println!("Games     : {}", stat["perf"]["nb"].as_i64().unwrap_or(0));
    println!(
        "Progress  : {:+}",
        stat["perf"]["progress"].as_i64().unwrap_or(0)
    );
    if let Some(rank) = stat["rank"].as_i64() {
        println!("Rank      : #{rank}");
    }
    if let Some(pct) = stat["percentile"].as_f64() {
        println!("Percentile: {:.1}%", pct * 100.0);
    }
    if let Some(h) = stat["stat"]["highest"]["int"].as_i64() {
        println!("Highest   : {h}");
    }
    if let Some(l) = stat["stat"]["lowest"]["int"].as_i64() {
        println!("Lowest    : {l}");
    }
    Ok(())
}
