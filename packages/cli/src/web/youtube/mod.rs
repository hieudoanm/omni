pub mod fetch;
pub mod internal;
pub mod thumbnails;
pub mod transcript;

use anyhow::Result;
use clap::{Args, Subcommand};

#[derive(Args)]
pub struct YoutubeArgs {
    #[command(subcommand)]
    pub command: Option<YoutubeCommand>,
}

#[derive(Subcommand)]
pub enum YoutubeCommand {
    /// Fetch YouTube video transcript
    Fetch(fetch::FetchArgs),
    /// Download YouTube video thumbnails
    Thumbnails(thumbnails::ThumbnailsArgs),
}

pub fn run(args: &YoutubeArgs, _json: bool) -> Result<()> {
    match &args.command {
        Some(YoutubeCommand::Fetch(a)) => fetch::run(a),
        Some(YoutubeCommand::Thumbnails(a)) => thumbnails::run(a),
        None => {
            println!("YouTube transcript and thumbnail tools\n");
            println!(
                "Fetch YouTube video transcripts and download thumbnails in various qualities.\n"
            );
            println!("Usage:\n  omni web youtube [command]\n");
            println!("Available Commands:");
            println!("  fetch        Fetch YouTube video transcript");
            println!("  thumbnails   Download YouTube video thumbnails");
            Ok(())
        }
    }
}
