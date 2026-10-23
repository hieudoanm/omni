pub mod matches;
pub mod members;
pub mod profile;

use anyhow::Result;
use clap::{Args, Subcommand};

#[derive(Args)]
pub struct ClubArgs {
    #[command(subcommand)]
    pub command: ClubCommand,
}

#[derive(Subcommand)]
pub enum ClubCommand {
    /// Show club profile
    Profile(profile::ProfileArgs),
    /// Show club members
    Members(members::MembersArgs),
    /// Show club matches
    Matches(matches::MatchesArgs),
}

pub fn run(args: &ClubArgs) -> Result<()> {
    match &args.command {
        ClubCommand::Profile(a) => profile::run(a),
        ClubCommand::Members(a) => members::run(a),
        ClubCommand::Matches(a) => matches::run(a),
    }
}
