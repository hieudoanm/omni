use super::shared;
use anyhow::{anyhow, Result};
use clap::Args;

#[derive(Args)]
pub struct CocArgs {
    /// Code of Conduct key (skip prompt)
    #[arg(long, default_value = "")]
    pub key: String,
    /// Output file path
    #[arg(long, short = 'o', default_value = "CODE_OF_CONDUCT")]
    pub output: String,
}

fn api(url: &str) -> Result<serde_json::Value> {
    let body = shared::fetch(url).map_err(|e| anyhow!("error fetching: {e}"))?;
    serde_json::from_slice(&body).map_err(|e| anyhow!("error parsing response: {e}"))
}

pub fn run(args: &CocArgs, json: bool) -> Result<()> {
    if json {
        if args.key.is_empty() {
            anyhow::bail!("--key is required for JSON output");
        }
        let v = api(&format!(
            "https://api.github.com/codes_of_conduct/{}",
            args.key
        ))
        .map_err(|e| anyhow!("error fetching code of conduct: {e}"))?;
        println!(
            "{}",
            serde_json::to_string_pretty(&serde_json::json!({
                "name": v["name"],
                "body": v["body"],
            }))?
        );
        return Ok(());
    }

    let list = api("https://api.github.com/codes_of_conduct")?;

    let key = if args.key.is_empty() {
        let keys: Vec<String> = list
            .as_array()
            .unwrap_or(&vec![])
            .iter()
            .map(|c| c["key"].as_str().unwrap_or("").to_string())
            .collect();
        shared::select("Select a Code of Conduct:", &keys)
            .map_err(|e| anyhow!("selection cancelled: {e}"))?
    } else {
        args.key.clone()
    };

    let v = api(&format!("https://api.github.com/codes_of_conduct/{key}"))
        .map_err(|e| anyhow!("error fetching code of conduct: {e}"))?;
    let name = v["name"].as_str().unwrap_or("");
    let body = v["body"].as_str().unwrap_or("");
    std::fs::write(&args.output, body).map_err(|e| anyhow!("error writing file: {e}"))?;
    println!("Written {name} ({key}) to {}", args.output);
    Ok(())
}
