use crate::pdf::internal::*;
use anyhow::Result;
use clap::Args;
use lopdf::encryption::crypt_filters::{Aes256CryptFilter, CryptFilter};
use lopdf::{EncryptionState, EncryptionVersion, Permissions};
use std::collections::BTreeMap;
use std::sync::Arc;

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
    let out = output_or(&args.file, &args.output);
    if args.decrypt {
        let mut doc = match lopdf::Document::load_with_password(&args.file, &args.password) {
            Ok(doc) => doc,
            Err(lopdf::Error::InvalidPassword) => {
                anyhow::bail!("incorrect password for {}", args.file)
            }
            Err(e) => {
                return Err(anyhow::Error::new(e).context(format!("cannot open {}", args.file)));
            }
        };
        save(&mut doc, &out)?;
        println!("Decrypted {}", out);
        return Ok(());
    }
    let mut doc = load(&args.file)?;
    encrypt_doc(&mut doc, &args.password)?;
    save(&mut doc, &out)?;
    println!("Encrypted {}", out);
    Ok(())
}

/// Encrypt a document in place with PDF 2.0 AES-256 (V5/R6, AESV3 filters).
pub(crate) fn encrypt_doc(doc: &mut lopdf::Document, password: &str) -> Result<()> {
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
    let file_key: [u8; 32] = rand::random();
    let owner_password: String = (0..32)
        .map(|_| char::from(b'a' + rand::random::<u8>() % 26))
        .collect();
    let mut crypt_filters: BTreeMap<Vec<u8>, Arc<dyn CryptFilter>> = BTreeMap::new();
    crypt_filters.insert(b"AESV3".to_vec(), Arc::new(Aes256CryptFilter));
    let version = EncryptionVersion::V5 {
        encrypt_metadata: true,
        crypt_filters,
        file_encryption_key: &file_key,
        stream_filter: b"AESV3".to_vec(),
        string_filter: b"AESV3".to_vec(),
        owner_password: &owner_password,
        user_password: password,
        permissions: Permissions::all(),
    };
    let state = EncryptionState::try_from(version)
        .map_err(|e| anyhow::anyhow!("cannot create encryption state: {}", e))?;
    doc.encrypt(&state)
        .map_err(|e| anyhow::anyhow!("encrypt failed: {}", e))?;
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::pdf::internal::{add_blank_page, blank_document, save};
    use lopdf::Document;

    fn fixture() -> (lopdf::Document, std::path::PathBuf, std::path::PathBuf) {
        let mut doc = blank_document(612.0, 792.0);
        add_blank_page(&mut doc, 612.0, 792.0, Some("secret text")).unwrap();
        let dir = std::env::temp_dir();
        let enc = dir.join(format!("omni-aes-test-{}.pdf", std::process::id()));
        let dec = dir.join(format!("omni-aes-test-dec-{}.pdf", std::process::id()));
        (doc, enc, dec)
    }

    #[test]
    fn encrypts_with_aes256_and_roundtrips() {
        let (mut doc, enc, _dec) = fixture();
        encrypt_doc(&mut doc, "secret").unwrap();
        save(&mut doc, enc.to_str().unwrap()).unwrap();

        // Encryption dictionary advertises V5/R6 AESV3.
        let enc_id = doc.trailer.get(b"Encrypt").unwrap().as_reference().unwrap();
        let enc_dict = doc.get_dictionary(enc_id).unwrap();
        assert_eq!(enc_dict.get(b"V").unwrap().as_i64().unwrap(), 5);
        assert_eq!(enc_dict.get(b"R").unwrap().as_i64().unwrap(), 6);
        assert_eq!(enc_dict.get(b"Length").unwrap().as_i64().unwrap(), 256);

        // Wrong password is rejected; correct password decrypts fully.
        assert!(matches!(
            Document::load_with_password(&enc, "wrong"),
            Err(lopdf::Error::InvalidPassword)
        ));
        let mut opened = Document::load_with_password(&enc, "secret").unwrap();
        assert!(opened.was_encrypted());
        assert_eq!(opened.get_pages().len(), 1);
        let _ = &mut opened;

        let _ = std::fs::remove_file(&enc);
    }
}
