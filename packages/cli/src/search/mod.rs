pub mod code;
pub mod files;
pub mod text;
pub mod web;

use anyhow::Result;
use clap::{Args, Subcommand};

#[derive(Args)]
pub struct SearchArgs {
    #[command(subcommand)]
    pub command: Option<SearchCommand>,
    /// Output in JSON format
    #[arg(long, short = 'j', global = true)]
    pub json: bool,
}

#[derive(Subcommand)]
pub enum SearchCommand {
    /// Find code symbols (functions, types, variables)
    Code(code::CodeArgs),
    /// Find files by glob pattern
    Files(files::FilesArgs),
    /// Search file contents using regex
    Text(text::TextArgs),
    /// Search the internet
    Web(web::WebArgs),
}

pub fn run(args: &SearchArgs) -> Result<()> {
    match &args.command {
        Some(SearchCommand::Code(a)) => code::run(a, args.json),
        Some(SearchCommand::Files(a)) => files::run(a, args.json),
        Some(SearchCommand::Text(a)) => text::run(a, args.json),
        Some(SearchCommand::Web(a)) => web::run(a, args.json),
        None => {
            println!("Universal search for files, text, code, and the web\n");
            println!("Usage:\n  omni search [command]\n");
            println!("Available Commands:");
            println!("  code   Find code symbols (functions, types, variables)");
            println!("  files  Find files by glob pattern");
            println!("  text   Search file contents using regex");
            println!("  web    Search the internet");
            println!(
                "\nFlags:\n  -j, --json   Output in JSON format\n  -h, --help   help for search"
            );
            Ok(())
        }
    }
}
