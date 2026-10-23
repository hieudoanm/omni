pub mod code;
pub mod config;
pub mod hook;
pub mod lib;
pub mod models;
pub mod serve;
pub mod status;

use anyhow::Result;
use clap::{Args, Subcommand};

#[derive(Args)]
pub struct OpenrouterArgs {
    #[command(subcommand)]
    pub command: Option<OpenrouterCommand>,
    /// Output in JSON format
    #[arg(long, short = 'j', global = true)]
    pub json: bool,
}

#[derive(Subcommand)]
pub enum OpenrouterCommand {
    /// Start the OpenRouter HTTP server
    Serve(serve::ServeArgs),
    /// Probe free models for availability and latency
    Status(status::StatusArgs),
    /// List available free models from OpenRouter
    Models(models::ModelsArgs),
    /// Start webhook server and hook it to Telegram
    Hook(hook::HookArgs),
    /// AI coding assistant with file editing and bash access
    Code(code::CodeArgs),
}

pub fn run(args: &OpenrouterArgs) -> Result<()> {
    match &args.command {
        Some(OpenrouterCommand::Serve(a)) => serve::run(a),
        Some(OpenrouterCommand::Status(a)) => status::run(a, args.json),
        Some(OpenrouterCommand::Models(a)) => models::run(a),
        Some(OpenrouterCommand::Hook(_a)) => hook::run(),
        Some(OpenrouterCommand::Code(a)) => code::run(a),
        None => {
            println!("Interact with OpenRouter AI models and services\n");
            println!("Usage:\n  omni openrouter [command]\n");
            println!("Available Commands:");
            println!("  serve    Start the OpenRouter HTTP server");
            println!("  status   Probe free models for availability and latency");
            println!("  models   List available free models from OpenRouter");
            println!("  hook     Start webhook server on :8080 and expose via ngrok");
            println!("  code     AI coding assistant with file editing and bash access");
            Ok(())
        }
    }
}
