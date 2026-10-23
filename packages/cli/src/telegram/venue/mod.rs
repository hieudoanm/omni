pub mod send;

use anyhow::Result;
use clap::{Args, Subcommand};

#[derive(Args)]
pub struct VenueArgs {
    #[command(subcommand)]
    pub command: Command,
}

#[derive(Subcommand)]
pub enum Command {
    /// Send a venue
    Send(send::Args),
}

pub fn run(args: &VenueArgs) -> Result<()> {
    match &args.command {
        Command::Send(a) => send::run(a),
    }
}
