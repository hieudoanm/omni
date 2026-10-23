pub mod decode;
pub mod encode;

use anyhow::Result;
use clap::{Args, Subcommand};

#[derive(Args)]
pub struct BarcodeArgs {
    #[command(subcommand)]
    pub command: Option<BarcodeCommand>,
    /// Output in JSON format
    #[arg(long, short = 'j', global = true)]
    pub json: bool,
}

#[derive(Subcommand)]
pub enum BarcodeCommand {
    /// Encode data as a 1D barcode
    Encode(encode::EncodeArgs),
    /// Decode a 1D barcode from an image
    Decode(decode::DecodeArgs),
}

pub fn run(args: &BarcodeArgs) -> Result<()> {
    let json = args.json;
    match &args.command {
        Some(BarcodeCommand::Encode(a)) => encode::run(a, json),
        Some(BarcodeCommand::Decode(a)) => decode::run(a, json),
        None => {
            println!("Encode and decode 1D barcodes\n");
            println!("Usage:\n  omni crypto barcode [command]\n");
            println!("Available Commands:");
            println!("  encode  Encode data as a 1D barcode");
            println!("  decode  Decode a 1D barcode from an image");
            Ok(())
        }
    }
}
