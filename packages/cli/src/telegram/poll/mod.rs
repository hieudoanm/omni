pub mod send;

use anyhow::Result;
use clap::{Args, Subcommand};

#[derive(Args)]
pub struct PollArgs {
    #[command(subcommand)]
    pub command: Command,
}

#[derive(Subcommand)]
pub enum Command {
    /// Send a poll
    Send(send::Args),
}

pub fn run(args: &PollArgs) -> Result<()> {
    match &args.command {
        Command::Send(a) => send::run(a),
    }
}
