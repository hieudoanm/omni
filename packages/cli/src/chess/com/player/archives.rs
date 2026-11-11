use super::super::internal as com;
use anyhow::{anyhow, Result};
use clap::Args;

#[derive(Args)]
pub struct ArchivesArgs {
    /// Chess.com username
    #[arg(long, short = 'u')]
    pub username: String,
    /// Output in JSON format
    #[arg(long, short = 'j', global = true)]
    pub json: bool,
}

pub fn run(args: &ArchivesArgs) -> Result<()> {
    let url = format!(
        "{}/player/{}/games/archives",
        com::BASE,
        args.username.to_lowercase()
    );
    let body = com::get(&url).map_err(|e| anyhow!("failed to fetch archives: {e}"))?;
    let resp: serde_json::Value =
        serde_json::from_slice(&body).map_err(|e| anyhow!("failed to parse archives: {e}"))?;
    if args.json {
        return com::print_json(&resp);
    }
    let archives = resp["archives"].as_array().cloned().unwrap_or_default();
    if archives.is_empty() {
        println!("No archives found");
        return Ok(());
    }
    println!();
    for a in &archives {
        println!("{}", a.as_str().unwrap_or(""));
    }
    Ok(())
}
