//! Study PGN export.
use crate::chess::lichess::client;
use anyhow::{anyhow, Result};
use clap::Args;

#[derive(Args)]
pub struct StudyArgs {
    /// Study ID
    pub study_id: String,
    /// Output in JSON format
    #[arg(long, short = 'j', global = true)]
    pub json: bool,
}

pub fn run(args: &StudyArgs) -> Result<()> {
    let body = client::do_get(&format!("/study/{}.pgn", args.study_id), &[])
        .map_err(|e| anyhow!("failed to fetch study: {e}"))?;
    println!("{}", String::from_utf8_lossy(&body));
    Ok(())
}
