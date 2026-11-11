pub mod ocr;
pub mod repair;

use anyhow::Result;
use clap::{Args, Subcommand};

#[derive(Args)]
pub struct MaintainArgs {
    #[command(subcommand)]
    pub command: MaintainCommand,
}

#[derive(Subcommand)]
pub enum MaintainCommand {
    /// Run OCR on a PDF using tesseract
    Ocr(ocr::OcrArgs),
    /// Repair a corrupted PDF file
    Repair(repair::RepairArgs),
}

pub fn run(args: &MaintainArgs) -> Result<()> {
    match &args.command {
        MaintainCommand::Ocr(a) => ocr::run(a),
        MaintainCommand::Repair(a) => repair::run(a),
    }
}
