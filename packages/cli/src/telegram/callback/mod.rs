pub mod answer;

use anyhow::Result;
use clap::{Args, Subcommand};

#[derive(Args)]
pub struct CallbackArgs {
    #[command(subcommand)]
    pub command: Command,
}

#[derive(Subcommand)]
pub enum Command {
    /// Answer a callback query
    Answer(answer::Args),
}

pub fn run(args: &CallbackArgs) -> Result<()> {
    match &args.command {
        Command::Answer(a) => answer::run(a),
    }
}
