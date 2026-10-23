use super::shared;
use anyhow::{anyhow, Result};
use clap::Args;
use serde::Deserialize;

#[derive(Args)]
pub struct LicenseArgs {
    /// SPDX license identifier (skip prompt)
    #[arg(long = "spdx-id", default_value = "")]
    pub spdx_id: String,
    /// Output file path
    #[arg(long, short = 'o', default_value = "LICENSE")]
    pub output: String,
}

#[derive(Deserialize)]
struct License {
    #[serde(default)]
    #[allow(dead_code)]
    key: String,
    #[serde(default)]
    #[allow(dead_code)]
    name: String,
    #[serde(default)]
    spdx_id: String,
    #[serde(default)]
    #[allow(dead_code)]
    url: String,
    #[serde(default)]
    #[allow(dead_code)]
    body: String,
}

fn api(url: &str) -> Result<serde_json::Value> {
    let body = shared::fetch(url).map_err(|e| anyhow!("error fetching: {e}"))?;
    serde_json::from_slice(&body).map_err(|e| anyhow!("error parsing response: {e}"))
}

pub fn run(args: &LicenseArgs, json: bool) -> Result<()> {
    if json {
        if args.spdx_id.is_empty() {
            anyhow::bail!("--spdx-id is required for JSON output");
        }
        let v = api(&format!("https://api.github.com/licenses/{}", args.spdx_id))
            .map_err(|e| anyhow!("error fetching license: {e}"))?;
        println!(
            "{}",
            serde_json::to_string_pretty(&serde_json::json!({
                "name": v["name"],
                "spdx_id": v["spdx_id"],
                "url": v["url"],
                "body": v["body"],
            }))?
        );
        return Ok(());
    }

    let licenses: Vec<License> = serde_json::from_value(api("https://api.github.com/licenses")?)
        .map_err(|e| anyhow!("error parsing response: {e}"))?;

    let spdx = if args.spdx_id.is_empty() {
        let ids: Vec<String> = licenses.iter().map(|l| l.spdx_id.clone()).collect();
        shared::select("Select a license:", &ids)
            .map_err(|e| anyhow!("selection cancelled: {e}"))?
    } else {
        args.spdx_id.clone()
    };

    let v = api(&format!("https://api.github.com/licenses/{spdx}"))
        .map_err(|e| anyhow!("error fetching license: {e}"))?;
    let name = v["name"].as_str().unwrap_or("");
    let spdx_id = v["spdx_id"].as_str().unwrap_or("");
    let body = v["body"].as_str().unwrap_or("");
    std::fs::write(&args.output, body).map_err(|e| anyhow!("error writing file: {e}"))?;
    println!("Written {name} ({spdx_id}) to {}", args.output);
    Ok(())
}
