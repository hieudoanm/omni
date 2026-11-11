pub mod internal;
pub mod shopify;
pub mod simplify;
pub mod snapshot;
pub mod weather;
pub mod youtube;

use anyhow::Result;
use clap::{Args, Subcommand};

#[derive(Args)]
pub struct WebArgs {
    #[command(subcommand)]
    pub command: Option<WebCommand>,
    /// Output in JSON format
    #[arg(long, short = 'j', global = true)]
    pub json: bool,
}

#[derive(Subcommand)]
pub enum WebCommand {
    /// Detect if a website is using Shopify
    #[command(name = "shopify")]
    Shopify(shopify::ShopifyArgs),
    /// Extract and convert web content
    #[command(name = "simplify")]
    Simplify(simplify::SimplifyArgs),
    /// Take a screenshot of a web page
    Snapshot(snapshot::SnapshotArgs),
    /// Check current weather for a city
    Weather(weather::WeatherArgs),
    /// YouTube transcript and thumbnail tools
    Youtube(youtube::YoutubeArgs),
}

pub fn run(args: &WebArgs) -> Result<()> {
    match &args.command {
        Some(WebCommand::Shopify(a)) => shopify::run(a, args.json),
        Some(WebCommand::Simplify(a)) => simplify::run(a, args.json),
        Some(WebCommand::Snapshot(a)) => snapshot::run(a, args.json),
        Some(WebCommand::Weather(a)) => weather::run(a, args.json),
        Some(WebCommand::Youtube(a)) => youtube::run(a, args.json),
        None => {
            println!("Web service tools\n");
            println!("Interact with web services: download Instagram content, detect Shopify sites, capture page snapshots, fetch weather, and retrieve YouTube transcripts.\n");
            println!("Usage:\n  omni web [command]\n");
            println!("Available Commands:");
            println!("  shopify    Detect if a website is using Shopify");
            println!("  simplify   Extract and convert web content");
            println!("  snapshot   Take a screenshot of a web page");
            println!("  weather    Check current weather for a city");
            println!("  youtube    YouTube transcript and thumbnail tools");
            Ok(())
        }
    }
}
