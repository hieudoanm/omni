pub mod get_me;
pub mod set_commands;
pub mod set_description;
pub mod set_name;
pub mod set_short_description;

use anyhow::Result;
use clap::{Args, Subcommand};

#[derive(Args)]
pub struct BotArgs {
    #[command(subcommand)]
    pub command: Command,
}

#[derive(Subcommand)]
pub enum Command {
    /// Get bot info
    #[command(name = "get-me")]
    GetMe(get_me::Args),
    /// Set bot name
    #[command(name = "set-name")]
    SetName(set_name::Args),
    /// Set bot description
    #[command(name = "set-description")]
    SetDescription(set_description::Args),
    /// Set bot short description
    #[command(name = "set-short-description")]
    SetShortDescription(set_short_description::Args),
    /// Set bot commands
    #[command(name = "set-commands")]
    SetCommands(set_commands::Args),
}

pub fn run(args: &BotArgs) -> Result<()> {
    match &args.command {
        Command::GetMe(a) => get_me::run(a),
        Command::SetName(a) => set_name::run(a),
        Command::SetDescription(a) => set_description::run(a),
        Command::SetShortDescription(a) => set_short_description::run(a),
        Command::SetCommands(a) => set_commands::run(a),
    }
}
