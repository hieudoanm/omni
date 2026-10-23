pub mod clubs;
pub mod players;
pub mod profile;

use anyhow::Result;
use clap::{Args, Subcommand};

#[derive(Args)]
pub struct CountryArgs {
    #[command(subcommand)]
    pub command: CountryCommand,
}

#[derive(Subcommand)]
pub enum CountryCommand {
    /// Show country profile
    Profile(profile::ProfileArgs),
    /// Show country players
    Players(players::PlayersArgs),
    /// Show country clubs
    Clubs(clubs::ClubsArgs),
}

pub fn run(args: &CountryArgs) -> Result<()> {
    match &args.command {
        CountryCommand::Profile(a) => profile::run(a),
        CountryCommand::Players(a) => players::run(a),
        CountryCommand::Clubs(a) => clubs::run(a),
    }
}
