pub mod send;

use anyhow::Result;
use clap::{Args, Subcommand};

#[derive(Args)]
pub struct ContactArgs {
    #[command(subcommand)]
    pub command: Command,
}

#[derive(Subcommand)]
pub enum Command {
    /// Send a contact
    Send(send::Args),
}

pub fn run(args: &ContactArgs) -> Result<()> {
    match &args.command {
        Command::Send(a) => send::run(a),
    }
}
