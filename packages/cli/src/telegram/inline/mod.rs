pub mod answer;

use anyhow::Result;
use clap::{Args, Subcommand};

#[derive(Args)]
pub struct InlineArgs {
    #[command(subcommand)]
    pub command: Command,
}

#[derive(Subcommand)]
pub enum Command {
    /// Answer an inline query
    Answer(answer::Args),
}

pub fn run(args: &InlineArgs) -> Result<()> {
    match &args.command {
        Command::Answer(a) => answer::run(a),
    }
}
