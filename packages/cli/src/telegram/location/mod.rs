pub mod send;

use anyhow::Result;
use clap::{Args, Subcommand};

#[derive(Args)]
pub struct LocationArgs {
    #[command(subcommand)]
    pub command: Command,
}

#[derive(Subcommand)]
pub enum Command {
    /// Send a location
    Send(send::Args),
}

pub fn run(args: &LocationArgs) -> Result<()> {
    match &args.command {
        Command::Send(a) => send::run(a),
    }
}
