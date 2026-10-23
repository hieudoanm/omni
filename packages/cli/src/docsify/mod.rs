pub mod cobra;
pub mod internal;
pub mod obsidian;
pub mod scan;
pub mod tree;

use anyhow::Result;
use clap::{Args, Subcommand};

#[derive(Args)]
pub struct DocsifyArgs {
    #[command(subcommand)]
    pub command: Option<DocsifyCommand>,
    /// Output in JSON format
    #[arg(long, short = 'j', global = true)]
    pub json: bool,
}

#[derive(Subcommand)]
pub enum DocsifyCommand {
    /// Generate README.md documentation from a Cobra CLI project
    Cobra(cobra::CobraArgs),
    /// Build a wiki-link graph from markdown files
    Obsidian(obsidian::ObsidianArgs),
    /// Scan a codebase and generate a GraphML file
    Scan(scan::ScanArgs),
    /// Generate directory tree as Markdown
    Tree(tree::TreeArgs),
}

pub fn run(args: &DocsifyArgs) -> Result<()> {
    match &args.command {
        Some(DocsifyCommand::Cobra(a)) => cobra::run(a),
        Some(DocsifyCommand::Obsidian(a)) => obsidian::run(a),
        Some(DocsifyCommand::Scan(a)) => scan::run(a),
        Some(DocsifyCommand::Tree(a)) => tree::run(a),
        None => {
            println!("Codebase documentation and analysis tools");
            println!("\nUsage:\n  omni docsify [command]\n");
            println!("Available Commands:");
            println!("  cobra     Generate README.md documentation from a Cobra CLI project");
            println!("  obsidian  Build a wiki-link graph from markdown files");
            println!("  scan      Scan a codebase and generate a GraphML file");
            println!("  tree      Generate directory tree as Markdown");
            Ok(())
        }
    }
}
