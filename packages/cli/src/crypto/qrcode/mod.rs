pub mod decode;
pub mod encode;

use anyhow::Result;
use clap::{Args, Subcommand};

#[derive(Args)]
pub struct QrcodeArgs {
    #[command(subcommand)]
    pub command: Option<QrcodeCommand>,
    /// Output in JSON format
    #[arg(long, short = 'j', global = true)]
    pub json: bool,
}

#[derive(Subcommand)]
pub enum QrcodeCommand {
    /// Encode data as a QR code
    Encode(encode::EncodeArgs),
    /// Decode a QR code from an image
    Decode(decode::DecodeArgs),
}

pub fn run(args: &QrcodeArgs) -> Result<()> {
    let json = args.json;
    match &args.command {
        Some(QrcodeCommand::Encode(a)) => encode::run(a, json),
        Some(QrcodeCommand::Decode(a)) => decode::run(a, json),
        None => {
            println!("Encode and decode QR codes\n");
            println!("Usage:\n  omni crypto qrcode [command]\n");
            println!("Available Commands:");
            println!("  encode  Encode data as a QR code");
            println!("  decode  Decode a QR code from an image");
            Ok(())
        }
    }
}
