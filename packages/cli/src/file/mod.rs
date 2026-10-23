pub mod checksum;
pub mod chmod;
pub mod count;
pub mod duplicates;
pub mod edit;
pub mod filetype;
pub mod grep;
pub mod head;
pub mod read;
pub mod size;
pub mod stats;
pub mod tail;
pub mod write;

pub(crate) mod internal;

use anyhow::Result;
use clap::{Args, Subcommand};

#[derive(Args)]
pub struct FileArgs {
    #[command(subcommand)]
    pub command: Option<FileCommand>,
    /// Output in JSON format
    #[arg(long, short = 'j', global = true)]
    pub json: bool,
}

#[derive(Subcommand)]
pub enum FileCommand {
    /// Compute file checksum
    Checksum(checksum::ChecksumArgs),
    /// Change file permissions
    Chmod(chmod::ChmodArgs),
    /// Count lines, words, and bytes in a file
    Count(count::CountArgs),
    /// Find duplicate files by size and partial hash
    Duplicates(duplicates::DuplicatesArgs),
    /// Find and replace text in files
    Edit(edit::EditArgs),
    /// Search file contents using regex or fixed strings
    Grep(grep::GrepArgs),
    /// Show the first N lines of a file
    Head(head::HeadArgs),
    /// Read file content with line numbers
    Read(read::ReadArgs),
    /// Show file or directory size
    Size(size::SizeArgs),
    /// Analyze file statistics in a directory
    Stats(stats::StatsArgs),
    /// Show the last N lines of a file
    Tail(tail::TailArgs),
    /// Detect file type and metadata
    #[command(name = "type")]
    Type(filetype::TypeArgs),
    /// Write or append content to a file
    Write(write::WriteArgs),
}

pub fn run(args: &FileArgs) -> Result<()> {
    match &args.command {
        Some(FileCommand::Checksum(a)) => checksum::run(a, args.json),
        Some(FileCommand::Chmod(a)) => chmod::run(a, args.json),
        Some(FileCommand::Count(a)) => count::run(a, args.json),
        Some(FileCommand::Duplicates(a)) => duplicates::run(a, args.json),
        Some(FileCommand::Edit(a)) => edit::run(a, args.json),
        Some(FileCommand::Grep(a)) => grep::run(a, args.json),
        Some(FileCommand::Head(a)) => head::run(a, args.json),
        Some(FileCommand::Read(a)) => read::run(a, args.json),
        Some(FileCommand::Size(a)) => size::run(a, args.json),
        Some(FileCommand::Stats(a)) => stats::run(a, args.json),
        Some(FileCommand::Tail(a)) => tail::run(a, args.json),
        Some(FileCommand::Type(a)) => filetype::run(a, args.json),
        Some(FileCommand::Write(a)) => write::run(a, args.json),
        None => {
            println!("File introspection and analysis tools\n");
            println!("Usage:\n  omni file [command]\n");
            println!("Available Commands:");
            println!("  checksum    Compute file checksum");
            println!("  chmod       Change file permissions");
            println!("  count       Count lines, words, and bytes in a file");
            println!("  duplicates  Find duplicate files by size and partial hash");
            println!("  edit        Find and replace text in files");
            println!("  grep        Search file contents using regex or fixed strings");
            println!("  head        Show the first N lines of a file");
            println!("  read        Read file content with line numbers");
            println!("  size        Show file or directory size");
            println!("  stats       Analyze file statistics in a directory");
            println!("  tail        Show the last N lines of a file");
            println!("  type        Detect file type and metadata");
            println!("  write       Write or append content to a file");
            println!(
                "\nFlags:\n  -j, --json   Output in JSON format\n  -h, --help   help for file"
            );
            Ok(())
        }
    }
}
