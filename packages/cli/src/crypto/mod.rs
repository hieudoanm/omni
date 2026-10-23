pub mod barcode;
pub mod decrypt;
pub mod encrypt;
pub mod hash;
pub mod internal;
pub mod jwt;
pub mod keygen;
pub mod passwd;
pub mod qrcode;
pub mod totp;
pub mod uuid_gen;

use anyhow::Result;
use clap::{Args, Subcommand};

#[derive(Args)]
pub struct CryptoArgs {
    #[command(subcommand)]
    pub command: Option<CryptoCommand>,
    /// Output in JSON format
    #[arg(long, short = 'j', global = true)]
    pub json: bool,
}

#[derive(Subcommand)]
pub enum CryptoCommand {
    /// Encode and decode 1D barcodes
    Barcode(barcode::BarcodeArgs),
    /// Compute hashes of text or files
    Hash(hash::HashArgs),
    /// Encode and decode JWTs
    Jwt(jwt::JwtArgs),
    /// Generate SSH-style key pairs
    Keygen(keygen::KeygenArgs),
    /// Generate secure random passwords
    Passwd(passwd::PasswdArgs),
    /// Encode and decode QR codes
    Qrcode(qrcode::QrcodeArgs),
    /// Encrypt a file with AES-256-GCM
    Encrypt(encrypt::EncryptArgs),
    /// Decrypt a file encrypted with crypto encrypt
    Decrypt(decrypt::DecryptArgs),
    /// Generate TOTP codes
    Totp(totp::TotpArgs),
    /// Generate UUIDs
    Uuid(uuid_gen::UuidArgs),
}

pub fn run(args: &CryptoArgs) -> Result<()> {
    let json = args.json;
    match &args.command {
        Some(CryptoCommand::Barcode(a)) => barcode::run(a),
        Some(CryptoCommand::Hash(a)) => hash::run(a, json),
        Some(CryptoCommand::Jwt(a)) => jwt::run(a),
        Some(CryptoCommand::Keygen(a)) => keygen::run(a, json),
        Some(CryptoCommand::Passwd(a)) => passwd::run(a, json),
        Some(CryptoCommand::Qrcode(a)) => qrcode::run(a),
        Some(CryptoCommand::Encrypt(a)) => encrypt::run(a, json),
        Some(CryptoCommand::Decrypt(a)) => decrypt::run(a, json),
        Some(CryptoCommand::Totp(a)) => totp::run(a, json),
        Some(CryptoCommand::Uuid(a)) => uuid_gen::run(a, json),
        None => {
            println!("Cryptographic and security tools\n");
            println!("Usage:\n  omni crypto [command]\n");
            println!("Available Commands:");
            println!("  barcode   Encode and decode 1D barcodes");
            println!("  hash      Compute hashes of text or files");
            println!("  jwt       Encode and decode JWTs");
            println!("  keygen    Generate SSH-style key pairs");
            println!("  passwd    Generate secure random passwords");
            println!("  qrcode    Encode and decode QR codes");
            println!("  encrypt   Encrypt a file with AES-256-GCM");
            println!("  decrypt   Decrypt a file encrypted with crypto encrypt");
            println!("  totp      Generate TOTP codes");
            println!("  uuid      Generate UUIDs");
            Ok(())
        }
    }
}
