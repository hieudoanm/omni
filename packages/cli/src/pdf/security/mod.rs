pub mod decrypt;
pub mod encrypt;

use anyhow::Result;
use clap::{Args, Subcommand};

#[derive(Args)]
pub struct SecurityArgs {
    #[command(subcommand)]
    pub command: SecurityCommand,
}

#[derive(Subcommand)]
pub enum SecurityCommand {
    /// Remove password protection from a PDF
    Decrypt(decrypt::DecryptArgs),
    /// Add or remove password protection from a PDF
    Encrypt(encrypt::EncryptArgs),
}

pub fn run(args: &SecurityArgs) -> Result<()> {
    match &args.command {
        SecurityCommand::Decrypt(a) => decrypt::run(a),
        SecurityCommand::Encrypt(a) => encrypt::run(a),
    }
}
