use super::super::internal as com;
use anyhow::{anyhow, Result};
use clap::Args;

#[derive(Args)]
pub struct OnlineArgs {
    /// Chess.com username
    #[arg(long, short = 'u')]
    pub username: String,
    /// Output in JSON format
    #[arg(long, short = 'j', global = true)]
    pub json: bool,
}

pub fn run(args: &OnlineArgs) -> Result<()> {
    let url = format!(
        "{}/player/{}/is-online",
        com::BASE,
        args.username.to_lowercase()
    );
    let body = com::get(&url).map_err(|e| anyhow!("failed to fetch online status: {e}"))?;
    let resp: serde_json::Value =
        serde_json::from_slice(&body).map_err(|e| anyhow!("failed to parse response: {e}"))?;
    if args.json {
        return com::print_json(&resp);
    }
    if resp["online"].as_bool().unwrap_or(false) {
        println!("{} is online", args.username);
    } else {
        println!("{} is offline", args.username);
    }
    Ok(())
}
