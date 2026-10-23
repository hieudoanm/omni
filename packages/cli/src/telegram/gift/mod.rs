pub mod send;

use anyhow::Result;
use clap::{Args, Subcommand};

#[derive(Args)]
pub struct GiftArgs {
    #[command(subcommand)]
    pub command: Command,
}

#[derive(Subcommand)]
pub enum Command {
    /// Send a gift
    Send(send::Args),
}

pub fn run(args: &GiftArgs) -> Result<()> {
    match &args.command {
        Command::Send(a) => send::run(a),
    }
}
