//! Google Gemini AI tools.
pub mod client;
pub mod code;

use anyhow::Result;
use clap::{Args, Subcommand};

#[derive(Args)]
pub struct GeminiArgs {
    #[command(subcommand)]
    pub command: GeminiCommand,
}

#[derive(Subcommand)]
pub enum GeminiCommand {
    /// Gemini-powered AI coding assistant
    Code(code::CodeArgs),
}

pub fn run(args: &GeminiArgs) -> Result<()> {
    match &args.command {
        GeminiCommand::Code(a) => code::run(a),
    }
}
