//! Terminal games (ported from cli.go games module).
use anyhow::Result;
use clap::{Args, Subcommand};

mod anagram;
mod internal;
mod reaction;
mod recall;
mod typerace;
mod wordle;

#[derive(Args)]
pub struct GamesArgs {
    #[command(subcommand)]
    pub command: GamesCommand,
}

#[derive(Subcommand)]
pub enum GamesCommand {
    /// Unscramble the letters to form a word
    Anagram,
    /// Test your reaction time
    Reaction,
    /// Test your short-term number memory
    Recall,
    /// Measure your typing speed and accuracy
    Typerace,
    /// Play Wordle - guess the 5-letter word
    Wordle {
        /// Output game result as JSON
        #[arg(long)]
        json: bool,
    },
}

pub fn run(args: &GamesArgs) -> Result<()> {
    match &args.command {
        GamesCommand::Anagram => anagram::run(),
        GamesCommand::Reaction => reaction::run(),
        GamesCommand::Recall => recall::run(),
        GamesCommand::Typerace => typerace::run(),
        GamesCommand::Wordle { json } => wordle::run(*json),
    }
}
