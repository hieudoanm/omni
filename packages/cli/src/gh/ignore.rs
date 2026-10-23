use super::shared;
use anyhow::{anyhow, Result};
use clap::Args;

#[derive(Args)]
pub struct IgnoreArgs {
    /// Gitignore template name (skip prompt)
    #[arg(long, default_value = "")]
    pub name: String,
    /// Output file path
    #[arg(long, short = 'o', default_value = ".gitignore")]
    pub output: String,
}

fn api(url: &str) -> Result<serde_json::Value> {
    let body = shared::fetch(url).map_err(|e| anyhow!("error fetching: {e}"))?;
    serde_json::from_slice(&body).map_err(|e| anyhow!("error parsing response: {e}"))
}

pub fn run(args: &IgnoreArgs, json: bool) -> Result<()> {
    if json {
        if args.name.is_empty() {
            anyhow::bail!("--name is required for JSON output");
        }
        let v = api(&format!(
            "https://api.github.com/gitignore/templates/{}",
            args.name
        ))
        .map_err(|e| anyhow!("error fetching template: {e}"))?;
        println!(
            "{}",
            serde_json::to_string_pretty(&serde_json::json!({
                "content": v["source"],
            }))?
        );
        return Ok(());
    }

    let names: Vec<String> =
        serde_json::from_value(api("https://api.github.com/gitignore/templates")?)
            .map_err(|e| anyhow!("error parsing response: {e}"))?;

    let name = if args.name.is_empty() {
        shared::select("Select a .gitignore template:", &names)
            .map_err(|e| anyhow!("selection cancelled: {e}"))?
    } else {
        args.name.clone()
    };

    let v = api(&format!(
        "https://api.github.com/gitignore/templates/{name}"
    ))
    .map_err(|e| anyhow!("error fetching template: {e}"))?;
    let source = v["source"].as_str().unwrap_or("");
    std::fs::write(&args.output, source).map_err(|e| anyhow!("error writing file: {e}"))?;
    println!("Written {name} .gitignore template to {}", args.output);
    Ok(())
}
