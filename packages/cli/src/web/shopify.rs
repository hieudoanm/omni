use anyhow::{anyhow, Result};
use clap::Args;
use serde_json::json;
use std::io::Read;

#[derive(Args)]
pub struct ShopifyArgs {
    #[command(subcommand)]
    pub command: Option<ShopifyCommand>,
}

#[derive(clap::Subcommand)]
pub enum ShopifyCommand {
    /// Detect if a website is using Shopify
    Detect(DetectArgs),
}

#[derive(Args)]
pub struct DetectArgs {
    /// Website URL to check
    pub url: Option<String>,
    /// Show detection signals
    #[arg(long, short = 'v')]
    pub verbose: bool,
    /// Output in JSON format
    #[arg(long)]
    pub json: bool,
}

fn check_shopify(url: &str) -> Result<(bool, bool, Vec<String>)> {
    let agent = ureq::Agent::config_builder()
        .timeout_global(Some(std::time::Duration::from_secs(10)))
        .build()
        .new_agent();
    let mut resp = agent
        .get(url)
        .header("User-Agent", "shopify-check/1.0")
        .call()
        .map_err(|e| anyhow!("error checking shopify: {e}"))?;
    let mut is_shopify = false;
    let mut is_plus = false;
    let mut signals = Vec::new();
    for (name, value) in resp.headers() {
        let lk = name.as_str().to_lowercase();
        if lk.starts_with("x-shopify") {
            is_shopify = true;
            signals.push(format!("Header: {name}"));
            if lk == "x-shopify-stage" || lk == "x-shopify-shop-api-call-limit" {
                is_plus = true;
            }
        }
        if value
            .to_str()
            .map(|v| v.to_lowercase().contains("shopify"))
            .unwrap_or(false)
        {
            is_shopify = true;
            signals.push(format!("Header value: {name}"));
        }
    }
    let mut buf = vec![0u8; 16 * 1024];
    let n = resp.body_mut().as_reader().read(&mut buf).unwrap_or(0);
    let html = String::from_utf8_lossy(&buf[..n]).to_lowercase();
    if html.contains("cdn.shopify.com") {
        is_shopify = true;
        signals.push("HTML: cdn.shopify.com".into());
    }
    if html.contains("shopify-section") {
        is_shopify = true;
        signals.push("HTML: shopify-section".into());
    }
    if html.contains("shopify-plus") {
        is_plus = true;
        signals.push("HTML: shopify-plus".into());
    }
    Ok((is_shopify, is_plus, signals))
}

fn green(s: &str) -> String {
    format!("\x1b[32m{s}\x1b[0m")
}
fn yellow(s: &str) -> String {
    format!("\x1b[33m{s}\x1b[0m")
}
fn dim(s: &str) -> String {
    format!("\x1b[2m{s}\x1b[0m")
}

pub fn run(args: &ShopifyArgs, _json: bool) -> Result<()> {
    match &args.command {
        Some(ShopifyCommand::Detect(a)) => run_detect(a),
        None => {
            println!("Detect if a website is using Shopify");
            Ok(())
        }
    }
}

fn run_detect(args: &DetectArgs) -> Result<()> {
    let url = match &args.url {
        Some(u) => u.clone(),
        None => {
            print!("Enter website URL: ");
            use std::io::Write;
            std::io::stdout().flush()?;
            let mut line = String::new();
            std::io::stdin().read_line(&mut line)?;
            line.trim().to_string()
        }
    };
    if url.is_empty() {
        return Err(anyhow!("URL is required"));
    }
    let url = if url.starts_with("http://") || url.starts_with("https://") {
        url
    } else {
        format!("https://{url}")
    };
    let (is_shopify, is_plus, signals) = check_shopify(&url)?;
    if args.json {
        println!(
            "{}",
            serde_json::to_string_pretty(&json!({
                "url": url, "shopify": is_shopify, "plus": is_plus, "signals": signals,
            }))?
        );
        return Ok(());
    }
    if !is_shopify {
        return Err(anyhow!("shopify not detected"));
    }
    println!("{}", green("Shopify detected"));
    if is_plus {
        println!("{}", green("Shopify Plus detected"));
    } else {
        println!("{}", yellow("Shopify Plus not detected"));
    }
    if args.verbose {
        println!("{}", dim("\nSignals:"));
        for s in &signals {
            println!("{}", dim(&format!(" - {s}")));
        }
    }
    Ok(())
}
