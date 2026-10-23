use aes_gcm::aead::{Aead, KeyInit};
use aes_gcm::{Aes256Gcm, Nonce};
use anyhow::{anyhow, Result};
use clap::Args;
use sha2::{Digest, Sha256};

#[derive(Args)]
pub struct DecryptArgs {
    /// File to decrypt
    #[arg(long, short = 'f', default_value = "")]
    pub file: String,
    /// Decryption password
    #[arg(long, short = 'p', default_value = "")]
    pub password: String,
    /// Output file
    #[arg(long, short = 'o', default_value = "")]
    pub output: String,
    /// Input file (positional)
    pub input: Option<String>,
}

pub fn run(args: &DecryptArgs, json: bool) -> Result<()> {
    let file = if !args.file.is_empty() {
        args.file.clone()
    } else {
        args.input.clone().unwrap_or_default()
    };
    if file.is_empty() {
        return Err(anyhow!("no input file"));
    }
    let data = std::fs::read(&file).map_err(|e| anyhow!("{e}"))?;
    let key_bytes = Sha256::digest(args.password.as_bytes());
    let cipher = Aes256Gcm::new_from_slice(&key_bytes).map_err(|_| anyhow!("invalid key"))?;
    if data.len() < 12 {
        return Err(anyhow!("file too small to be valid encrypted data"));
    }
    let (nonce_bytes, ciphertext) = data.split_at(12);
    let nonce = Nonce::try_from(nonce_bytes).map_err(|_| anyhow!("invalid nonce"))?;
    let plaintext = cipher
        .decrypt(&nonce, ciphertext)
        .map_err(|_| anyhow!("decryption failed (wrong password or corrupted file)"))?;

    let out_path = if !args.output.is_empty() {
        args.output.clone()
    } else if file.ends_with(".enc") {
        file[..file.len() - 4].to_string()
    } else {
        format!("{file}.dec")
    };
    std::fs::write(&out_path, plaintext)?;
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
