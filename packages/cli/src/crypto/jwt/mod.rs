pub mod decode;
pub mod encode;

use anyhow::Result;
use clap::{Args, Subcommand};

#[derive(Args)]
pub struct JwtArgs {
    #[command(subcommand)]
    pub command: Option<JwtCommand>,
    /// Output in JSON format
    #[arg(long, short = 'j', global = true)]
    pub json: bool,
}

#[derive(Subcommand)]
pub enum JwtCommand {
    /// Encode (sign) a JWT
    Encode(encode::EncodeArgs),
    /// Decode a JWT without verification
    Decode(decode::DecodeArgs),
}

pub fn run(args: &JwtArgs) -> Result<()> {
    let json = args.json;
    match &args.command {
        Some(JwtCommand::Encode(a)) => encode::run(a, json),
        Some(JwtCommand::Decode(a)) => decode::run(a, json),
        None => {
            println!("Encode and decode JWTs\n");
            println!("Usage:\n  omni crypto jwt [command]\n");
            println!("Available Commands:");
            println!("  encode  Encode (sign) a JWT");
            println!("  decode  Decode a JWT without verification");
            Ok(())
        }
    }
}
