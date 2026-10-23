use super::super::internal as com;
use anyhow::{anyhow, Result};
use clap::Args;

#[derive(Args)]
pub struct PgnArgs {
    /// Chess.com username
    #[arg(long, short = 'u')]
    pub username: String,
    /// Year (YYYY)
    #[arg(long, short = 'y')]
    pub year: String,
    /// Month (MM)
    #[arg(long, short = 'm')]
    pub month: String,
    /// Output in JSON format
    #[arg(long, short = 'j', global = true)]
    pub json: bool,
}

pub fn run(args: &PgnArgs) -> Result<()> {
    let url = format!(
        "{}/player/{}/games/{}/{}/pgn",
        com::BASE,
        args.username.to_lowercase(),
        args.year,
        args.month
    );
    let body = com::get(&url).map_err(|e| anyhow!("failed to download PGN: {e}"))?;
    println!("{}", String::from_utf8_lossy(&body));
    Ok(())
}
