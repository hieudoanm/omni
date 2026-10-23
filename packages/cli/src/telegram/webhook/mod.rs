pub mod delete;
pub mod info;
pub mod set;

use anyhow::Result;
use clap::{Args, Subcommand};

#[derive(Args)]
pub struct WebhookArgs {
    #[command(subcommand)]
    pub command: Command,
}

#[derive(Subcommand)]
pub enum Command {
    /// Delete the Telegram webhook
    Delete(delete::Args),
    /// Get current webhook info
    Info(info::Args),
    /// Set a Telegram webhook URL
    Set(set::Args),
}

pub fn run(args: &WebhookArgs) -> Result<()> {
    match &args.command {
        Command::Delete(a) => delete::run(a),
        Command::Info(a) => info::run(a),
        Command::Set(a) => set::run(a),
    }
}
