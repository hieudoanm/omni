use super::internal;
use anyhow::Result;
use clap::Args;
use sha2::Digest;

#[derive(Args)]
pub struct ChecksumArgs {
    /// Hash algorithm: md5, sha1, sha256, sha512
    #[arg(long, short = 'a', default_value = "sha256")]
    pub algorithm: String,
    /// File path
    #[arg(long, short = 'f', default_value = "")]
    pub file: String,
}

pub fn run(args: &ChecksumArgs, json: bool) -> Result<()> {
    let data = internal::read_file_bytes(&args.file)?;
    let hash = match args.algorithm.as_str() {
        "md5" => {
            let mut h = md5::Md5::new();
            h.update(&data);
            hex::encode(h.finalize())
        }
        "sha1" => {
            let mut h = sha1::Sha1::new();
            h.update(&data);
            hex::encode(h.finalize())
        }
        "sha512" => {
            let mut h = sha2::Sha512::new();
            h.update(&data);
            hex::encode(h.finalize())
        }
        _ => {
            let mut h = sha2::Sha256::new();
            h.update(&data);
            hex::encode(h.finalize())
        }
    };

    if json {
        println!(
            "{}",
            serde_json::to_string_pretty(&serde_json::json!({
                "file": args.file,
                "algorithm": args.algorithm,
                "hash": hash,
            }))?
        );
    } else {
        println!("{hash}  {}", args.file);
    }
    Ok(())
}
