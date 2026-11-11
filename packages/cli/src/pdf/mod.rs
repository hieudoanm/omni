pub mod addnumbers;
pub mod annotate;
pub mod cmap;
pub mod combine;
pub mod convert;
pub mod create;
pub mod crop;
pub mod delete;
pub mod edit;
pub mod extract;
pub mod inspect;
pub mod internal;
pub mod maintain;
pub mod rearrange;
pub mod security;

use anyhow::Result;
use clap::{Args, Subcommand};

#[derive(Args)]
pub struct PdfArgs {
    #[command(subcommand)]
    pub command: Option<PdfCommand>,
    /// Output in JSON format
    #[arg(long, short = 'j', global = true)]
    pub json: bool,
}

#[derive(Subcommand)]
pub enum PdfCommand {
    /// Add page numbers to a PDF
    #[command(name = "add-numbers")]
    AddNumbers(addnumbers::AddNumbersArgs),
    /// Add a text annotation to a PDF
    Annotate(annotate::AnnotateArgs),
    /// Combine PDF files
    Combine(combine::CombineArgs),
    /// Convert between PDF and images
    Convert(convert::ConvertArgs),
    /// Create a PDF from text
    Create(create::CreateArgs),
    /// Crop pages in a PDF
    Crop(crop::CropArgs),
    /// Delete pages from a PDF
    Delete(delete::DeleteArgs),
    /// Edit PDF files
    Edit(edit::EditArgs),
    /// Extract content from a PDF
    Extract(extract::ExtractArgs),
    /// Inspect PDF files
    Inspect(inspect::InspectArgs),
    /// Maintain PDF files
    Maintain(maintain::MaintainArgs),
    /// Rearrange pages in a PDF
    Rearrange(rearrange::RearrangeArgs),
    /// Encrypt or decrypt a PDF
    Security(security::SecurityArgs),
}

pub fn run(args: &PdfArgs) -> Result<()> {
    match &args.command {
        Some(PdfCommand::AddNumbers(a)) => addnumbers::run(a),
        Some(PdfCommand::Annotate(a)) => annotate::run(a),
        Some(PdfCommand::Combine(a)) => combine::run(a),
        Some(PdfCommand::Convert(a)) => convert::run(a),
        Some(PdfCommand::Create(a)) => create::run(a),
        Some(PdfCommand::Crop(a)) => crop::run(a),
        Some(PdfCommand::Delete(a)) => delete::run(a),
        Some(PdfCommand::Edit(a)) => edit::run(a),
        Some(PdfCommand::Extract(a)) => extract::run(a),
        Some(PdfCommand::Inspect(a)) => inspect::run(a),
        Some(PdfCommand::Maintain(a)) => maintain::run(a),
        Some(PdfCommand::Rearrange(a)) => rearrange::run(a),
        Some(PdfCommand::Security(a)) => security::run(a),
        None => {
            println!("PDF manipulation tools\n");
            println!("Usage:\n  omni pdf [command]\n");
            println!("Available Commands:");
            println!("  add-numbers  Add page numbers to a PDF");
            println!("  annotate     Add a text annotation to a PDF");
            println!("  combine      Combine PDF files");
            println!("  convert      Convert between PDF and images");
            println!("  create       Create a PDF from text");
            println!("  crop         Crop pages in a PDF");
            println!("  delete       Delete pages from a PDF");
            println!("  edit         Edit PDF files");
            println!("  extract      Extract content from a PDF");
            println!("  inspect      Inspect PDF files");
            println!("  maintain     Maintain PDF files");
            println!("  rearrange    Rearrange pages in a PDF");
            println!("  security     Encrypt or decrypt a PDF");
            println!();
            println!("Flags:");
            println!("  -j, --json   Output in JSON format");
            Ok(())
        }
    }
}
