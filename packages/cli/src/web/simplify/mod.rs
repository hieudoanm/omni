pub mod csv;
pub mod images;
pub mod md;

use anyhow::Result;
use clap::{Args, Subcommand};

#[derive(Args)]
pub struct SimplifyArgs {
    #[command(subcommand)]
    pub command: Option<SimplifyCommand>,
}

#[derive(Subcommand)]
pub enum SimplifyCommand {
    /// Extract HTML tables to CSV
    Csv(csv::CsvArgs),
    /// Convert webpage to markdown
    Md(md::MdArgs),
    /// Download images from a fully rendered webpage
    Images(images::ImagesArgs),
}

pub fn run(args: &SimplifyArgs, _json: bool) -> Result<()> {
    match &args.command {
        Some(SimplifyCommand::Csv(a)) => csv::run(a),
        Some(SimplifyCommand::Md(a)) => md::run(a),
        Some(SimplifyCommand::Images(a)) => images::run(a),
        None => {
            println!("Extract tables to CSV or webpage content to Markdown.\n");
            println!("Usage:\n  omni web simplify [command]\n");
            println!("Available Commands:");
            println!("  csv      Extract HTML tables to CSV");
            println!("  images   Download images from a fully rendered webpage");
            println!("  md       Convert webpage to markdown");
            Ok(())
        }
    }
}
