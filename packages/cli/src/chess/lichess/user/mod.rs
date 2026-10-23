//! User subcommands.
pub mod activity;
pub mod perf;
pub mod profile;
pub mod rating;
pub mod status;

use anyhow::Result;
use clap::{Args, Subcommand};

#[derive(Args)]
pub struct UserArgs {
    #[command(subcommand)]
    pub command: UserCommand,
}

#[derive(Subcommand)]
pub enum UserCommand {
    /// Fetch a user's public profile
    Profile(profile::ProfileArgs),
    /// Check if users are online/playing
    Status(status::StatusArgs),
    /// Fetch a user's recent activity
    Activity(activity::ActivityArgs),
    /// Fetch a user's rating history
    #[command(name = "rating-history")]
    Rating(rating::RatingArgs),
    /// Fetch performance stats for a specific rating type
    Perf(perf::PerfArgs),
}

pub fn run(args: &UserArgs) -> Result<()> {
    match &args.command {
        UserCommand::Profile(a) => profile::run(a),
        UserCommand::Status(a) => status::run(a),
        UserCommand::Activity(a) => activity::run(a),
        UserCommand::Rating(a) => rating::run(a),
        UserCommand::Perf(a) => perf::run(a),
    }
}
