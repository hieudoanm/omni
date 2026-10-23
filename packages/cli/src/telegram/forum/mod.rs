pub mod close;
pub mod create;
pub mod delete;
pub mod reopen;

use anyhow::Result;
use clap::{Args, Subcommand};

#[derive(Args)]
pub struct ForumArgs {
    #[command(subcommand)]
    pub command: Command,
}

#[derive(Subcommand)]
pub enum Command {
    /// Close a forum topic
    Close(close::Args),
    /// Create a forum topic
    Create(create::Args),
    /// Delete a forum topic
    Delete(delete::Args),
    /// Reopen a forum topic
    Reopen(reopen::Args),
}

pub fn run(args: &ForumArgs) -> Result<()> {
    match &args.command {
        Command::Close(a) => close::run(a),
        Command::Create(a) => create::run(a),
        Command::Delete(a) => delete::run(a),
        Command::Reopen(a) => reopen::run(a),
    }
}
