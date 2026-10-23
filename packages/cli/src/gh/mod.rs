pub mod coc;
pub mod ignore;
pub mod languages;
pub mod license;
pub mod og;
pub(crate) mod shared;

use anyhow::Result;
use clap::{Args, Subcommand};

#[derive(Args)]
pub struct GhArgs {
    #[command(subcommand)]
    pub command: Option<GhCommand>,
    /// Output in JSON format
    #[arg(long, short = 'j', global = true)]
    pub json: bool,
}

#[derive(Subcommand)]
pub enum GhCommand {
    /// Fetch a GitHub Code of Conduct
    Coc(coc::CocArgs),
    /// Fetch a .gitignore template from GitHub
    Ignore(ignore::IgnoreArgs),
    /// Show repository language breakdown and generate SVG bar chart
    Languages(languages::LanguagesArgs),
    /// Fetch a license template from GitHub
    License(license::LicenseArgs),
    /// Generate an Open Graph SVG for a GitHub repository
    Og(og::OgArgs),
}

pub fn run(args: &GhArgs) -> Result<()> {
    let json = args.json;
    match &args.command {
        Some(GhCommand::Coc(a)) => coc::run(a, json),
        Some(GhCommand::Ignore(a)) => ignore::run(a, json),
        Some(GhCommand::Languages(a)) => languages::run(a, json),
        Some(GhCommand::License(a)) => license::run(a, json),
        Some(GhCommand::Og(a)) => og::run(a, json),
        None => {
            println!("GitHub CLI tools\n");
            println!("Usage:\n  omni gh [command]\n");
            println!("Available Commands:");
            println!("  coc        Fetch a GitHub Code of Conduct");
            println!("  ignore     Fetch a .gitignore template from GitHub");
            println!("  languages  Show repository language breakdown and generate SVG bar chart");
            println!("  license    Fetch a license template from GitHub");
            println!("  og         Generate an Open Graph SVG for a GitHub repository");
            Ok(())
        }
    }
}
