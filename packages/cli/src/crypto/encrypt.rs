use aes_gcm::aead::{Aead, KeyInit};
use aes_gcm::{Aes256Gcm, Nonce};
use anyhow::{anyhow, Result};
use clap::Args;
use sha2::{Digest, Sha256};

#[derive(Args)]
pub struct EncryptArgs {
    /// File to encrypt
    #[arg(long, short = 'f', default_value = "")]
    pub file: String,
    /// Encryption password
    #[arg(long, short = 'p', default_value = "")]
    pub password: String,
    /// Output file (default: <file>.enc)
    #[arg(long, short = 'o', default_value = "")]
    pub output: String,
    /// Input file (positional)
    pub input: Option<String>,
}

pub fn run(args: &EncryptArgs, json: bool) -> Result<()> {
    let file = if !args.file.is_empty() {
        args.file.clone()
    } else {
        args.input.clone().unwrap_or_default()
    };
    if file.is_empty() {
        return Err(anyhow!("no input file"));
    }
    let plaintext = std::fs::read(&file).map_err(|e| anyhow!("{e}"))?;
    let key_bytes = Sha256::digest(args.password.as_bytes());
    let cipher = Aes256Gcm::new_from_slice(&key_bytes).map_err(|_| anyhow!("invalid key"))?;
    let nonce_bytes: [u8; 12] = rand::random();
    let nonce = Nonce::try_from(nonce_bytes.as_slice()).map_err(|_| anyhow!("invalid nonce"))?;
    let ciphertext = cipher
        .encrypt(&nonce, plaintext.as_ref())
        .map_err(|e| anyhow!("encrypt: {e}"))?;
    let mut out_data = nonce_bytes.to_vec();
    out_data.extend_from_slice(&ciphertext);

    let out_path = if args.output.is_empty() {
        format!("{file}.enc")
    } else {
        args.output.clone()
    };
    std::fs::write(&out_path, out_data)?;
    if json {
        println!(
            "{}",
            serde_json::to_string_pretty(&serde_json::json!({
                "input": file, "output": out_path,
            }))?
        );
    } else {
        println!("{out_path}");
    }
    Ok(())
}
