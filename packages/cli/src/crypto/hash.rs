use super::internal;
use anyhow::{anyhow, Result};
use clap::Args;
use hmac::{Hmac, KeyInit, Mac};
use sha2::Sha256;
use std::io::Read;

#[derive(Args)]
pub struct HashArgs {
    /// Hash algorithm (md5, sha1, sha256, sha512)
    #[arg(long, short = 'a', default_value = "sha256")]
    pub algorithm: String,
    /// Text to hash
    #[arg(long, short = 't', default_value = "")]
    pub text: String,
    /// HMAC key
    #[arg(long, short = 'k', default_value = "")]
    pub key: String,
    /// Verify file hash from 'hash filename' format
    #[arg(long)]
    pub check: bool,
    /// Input file (positional)
    pub file: Option<String>,
}

pub fn run(args: &HashArgs, json: bool) -> Result<()> {
    let input: Vec<u8> = if !args.text.is_empty() {
        args.text.as_bytes().to_vec()
    } else if let Some(f) = &args.file {
        std::fs::read(f).map_err(|e| anyhow!("read file: {e}"))?
    } else {
        let mut buf = Vec::new();
        std::io::stdin()
            .read_to_end(&mut buf)
            .map_err(|e| anyhow!("read stdin: {e}"))?;
        buf
    };

    if args.check {
        let s = String::from_utf8_lossy(&input);
        let s = s.trim();
        let mut parts = s.splitn(2, ' ');
        let (Some(expected), Some(filename)) = (parts.next(), parts.next()) else {
            return Err(anyhow!("invalid --check format: expected 'hash filename'"));
        };
        let file_content =
            std::fs::read(filename).map_err(|e| anyhow!("read file for check: {e}"))?;
        let actual = internal::compute_hash(&file_content, &args.algorithm)?;
        let status = actual == expected;
        if json {
            println!(
                "{}",
                serde_json::to_string_pretty(&serde_json::json!({
                    "filename": filename, "algorithm": args.algorithm,
                    "expected": expected, "actual": actual, "status": status,
                }))?
            );
        } else if status {
            println!("{filename}: OK");
        } else {
            println!("{filename}: FAILED");
            return Err(anyhow!("hash mismatch"));
        }
        return Ok(());
    }

    if !args.key.is_empty() {
        let digest = match args.algorithm.to_lowercase().as_str() {
            "md5" => {
                type M = md5::Md5;
                let mut mac =
                    Hmac::<M>::new_from_slice(args.key.as_bytes()).map_err(|e| anyhow!("{e}"))?;
                mac.update(&input);
                hex::encode(mac.finalize().into_bytes())
            }
            "sha1" => {
                type M = sha1::Sha1;
                let mut mac =
                    Hmac::<M>::new_from_slice(args.key.as_bytes()).map_err(|e| anyhow!("{e}"))?;
                mac.update(&input);
                hex::encode(mac.finalize().into_bytes())
            }
            "sha256" => {
                let mut mac = Hmac::<Sha256>::new_from_slice(args.key.as_bytes())
                    .map_err(|e| anyhow!("{e}"))?;
                mac.update(&input);
                hex::encode(mac.finalize().into_bytes())
            }
            "sha512" => {
                type M = sha2::Sha512;
                let mut mac =
                    Hmac::<M>::new_from_slice(args.key.as_bytes()).map_err(|e| anyhow!("{e}"))?;
                mac.update(&input);
                hex::encode(mac.finalize().into_bytes())
            }
            other => return Err(anyhow!("unknown algorithm: {other}")),
        };
        if json {
            println!(
                "{}",
                serde_json::to_string_pretty(&serde_json::json!({
                    "algorithm": args.algorithm, "mode": "hmac", "hash": digest,
                }))?
            );
        } else {
            println!("{digest}");
        }
    } else {
        let result = internal::compute_hash(&input, &args.algorithm)?;
        if json {
            println!(
                "{}",
                serde_json::to_string_pretty(&serde_json::json!({
                    "algorithm": args.algorithm, "hash": result,
                }))?
            );
        } else {
            println!("{result}");
        }
    }
    Ok(())
}
