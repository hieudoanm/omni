pub mod hex;
pub(crate) mod internal;
pub mod list;
pub mod name;
pub mod palettes;

use anyhow::Result;
use clap::{Args, Subcommand};

#[derive(Args)]
pub struct FigmaArgs {
    #[command(subcommand)]
    pub command: Option<FigmaCommand>,
}

#[derive(Subcommand)]
pub enum FigmaCommand {
    /// Find the closest named color to a given hex code
    Hex(hex::HexArgs),
    /// List all palette names from the Figma color directory
    List(list::ListArgs),
    /// Look up a color palette and show its colors
    Name(name::NameArgs),
    /// Display all color palettes with their colors
    Palettes(palettes::PalettesArgs),
}

pub fn run(args: &FigmaArgs, json: bool) -> Result<()> {
    match &args.command {
        Some(FigmaCommand::Hex(a)) => hex::run(a, json),
        Some(FigmaCommand::List(a)) => list::run(a, json),
        Some(FigmaCommand::Name(a)) => name::run(a, json),
        Some(FigmaCommand::Palettes(a)) => palettes::run(a, json),
        None => {
            println!("Figma color palettes: list, look up, and explore color palettes\n");
            println!("Usage:\n  omni colors figma [command]\n");
            println!("Available Commands:");
            println!("  hex        Find the closest named color to a given hex code");
            println!("  list       List all palette names from the Figma color directory");
            println!("  name       Look up a color palette and show its colors");
            println!("  palettes   Display all color palettes with their colors");
            Ok(())
        }
    }
}
