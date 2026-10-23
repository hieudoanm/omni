use super::super::internal as com;
use anyhow::{anyhow, Result};
use clap::Args;

#[derive(Args)]
pub struct ProfileArgs {
    /// ISO 3166-1 alpha-2 country code
    #[arg(long, short = 'c')]
    pub code: String,
    /// Output in JSON format
    #[arg(long, short = 'j', global = true)]
    pub json: bool,
}

pub fn run(args: &ProfileArgs) -> Result<()> {
    let url = format!("{}/country/{}", com::BASE, args.code.to_uppercase());
    let body = com::get(&url).map_err(|e| anyhow!("failed to fetch country: {e}"))?;
    let profile: serde_json::Value =
        serde_json::from_slice(&body).map_err(|e| anyhow!("failed to parse country: {e}"))?;
    if args.json {
        return com::print_json(&profile);
    }
    println!(
        "Country: {} ({})",
        com::s(&profile["name"]),
        com::s(&profile["code"])
    );
    Ok(())
}
