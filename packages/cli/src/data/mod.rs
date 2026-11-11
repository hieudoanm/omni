pub mod archive;
pub mod csv_cmd;
pub mod ebook;
pub mod excel;
pub mod json_cmd;
pub mod split;
pub mod xlsx;
pub mod yml;

pub(crate) mod internal;

use anyhow::Result;
use clap::{Args, Subcommand};

#[derive(Args)]
pub struct DataArgs {
    #[command(subcommand)]
    pub command: Option<DataCommand>,
    /// Output in JSON format
    #[arg(long, short = 'j', global = true)]
    pub json: bool,
}

#[derive(Subcommand)]
pub enum DataCommand {
    /// Create or extract zip archives
    Archive(archive::ArchiveArgs),
    /// View and format CSV files
    Csv(csv_cmd::CsvArgs),
    /// Convert e-book formats using calibre or pandoc
    Ebook(ebook::EbookArgs),
    /// Excel spreadsheet operations
    Excel(excel::ExcelArgs),
    /// Query, format, diff, and merge JSON data
    Json(json_cmd::JsonArgs),
    /// Split a CSV file into smaller chunks
    Split(split::SplitArgs),
    /// Parse, validate, and lint YAML files
    Yml(yml::YmlArgs),
}

pub fn run(args: &DataArgs) -> Result<()> {
    match &args.command {
        Some(DataCommand::Archive(a)) => archive::run(a),
        Some(DataCommand::Csv(a)) => csv_cmd::run(a, args.json),
        Some(DataCommand::Ebook(a)) => ebook::run(a),
        Some(DataCommand::Excel(a)) => excel::run(a),
        Some(DataCommand::Json(a)) => json_cmd::run(a),
        Some(DataCommand::Split(a)) => split::run(a),
        Some(DataCommand::Yml(a)) => yml::run(a, args.json),
        None => {
            println!("Format, convert, split, archive, and process data files.\n");
            println!("Usage:\n  omni data [command]\n");
            println!("Available Commands:");
            println!("  archive  Create or extract zip archives");
            println!("  csv      View and format CSV files");
            println!("  ebook    Convert e-book formats using calibre or pandoc");
            println!("  excel    Excel spreadsheet operations");
            println!("  json     Query, format, diff, and merge JSON data");
            println!("  split    Split a CSV file into smaller chunks");
            println!("  yml      Parse, validate, and lint YAML files");
            println!(
                "\nFlags:\n  -j, --json   Output in JSON format\n  -h, --help   help for data"
            );
            Ok(())
        }
    }
}
