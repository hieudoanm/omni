use crate::pdf::internal::*;
use anyhow::Result;
use clap::Args;
use lopdf::{EncryptionState, EncryptionVersion, Permissions};

#[derive(Args)]
pub struct EncryptArgs {
    /// PDF file
    pub file: String,
    /// Password for encryption/decryption
    #[arg(long, short = 'p', default_value = "")]
    pub password: String,
    /// Decrypt instead of encrypt
    #[arg(long, default_value_t = false)]
    pub decrypt: bool,
    /// Output file path (default: overwrite input)
    #[arg(long, short = 'o', default_value = "")]
    pub output: String,
}

pub fn run(args: &EncryptArgs) -> Result<()> {
    let mut doc = load(&args.file)?;
    let out = output_or(&args.file, &args.output);
    if args.decrypt {
        if doc.is_encrypted() {
            doc.decrypt(&args.password)
                .map_err(|e| anyhow::anyhow!("decrypt failed: {}", e))?;
        }
        save(&mut doc, &out)?;
        println!("Decrypted {}", out);
        return Ok(());
    }
    if doc.trailer.get(b"ID").is_err() {
        let id: Vec<u8> = (0..16).map(|_| rand::random::<u8>()).collect();
        let id2 = id.clone();
        doc.trailer.set(
            "ID",
            lopdf::Object::Array(vec![
                lopdf::Object::string_literal(id),
                lopdf::Object::string_literal(id2),
            ]),
        );
    }
    let version = EncryptionVersion::V2 {
        document: &doc,
        owner_password: "",
        user_password: &args.password,
        key_length: 128,
        permissions: Permissions::all(),
    };
    let state = EncryptionState::try_from(version)
        .map_err(|e| anyhow::anyhow!("cannot create encryption state: {}", e))?;
    doc.encrypt(&state)
        .map_err(|e| anyhow::anyhow!("encrypt failed: {}", e))?;
    save(&mut doc, &out)?;
    println!("Encrypted {}", out);
    Ok(())
}
