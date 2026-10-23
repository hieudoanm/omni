use anyhow::{anyhow, Result};
use clap::Args;
use hmac::{Hmac, KeyInit, Mac};
use sha2::{Sha256, Sha384, Sha512};
use std::io::Write;

#[derive(Args)]
pub struct EncodeArgs {
    /// Signing algorithm (HS256, HS384, HS512)
    #[arg(long, short = 'a', default_value = "HS256")]
    pub algorithm: String,
    /// Signing key (secret)
    #[arg(long, short = 'k', default_value = "")]
    pub key: String,
    /// Claims as JSON string
    #[arg(long, short = 'c', default_value = "")]
    pub claims: String,
}

fn b64url(data: &[u8]) -> String {
    base64::Engine::encode(&base64::engine::general_purpose::URL_SAFE_NO_PAD, data)
}

pub fn run(args: &EncodeArgs, json: bool) -> Result<()> {
    let mut claims_json = args.claims.clone();
    if claims_json.is_empty() {
        print!("Claims JSON: ");
        let _ = std::io::stdout().flush();
        std::io::stdin().read_line(&mut claims_json)?;
    }
    let claims: serde_json::Value = serde_json::from_str(claims_json.trim())
        .map_err(|e| anyhow!("invalid claims JSON: {e}"))?;

    let header = serde_json::json!({"alg": args.algorithm, "typ": "JWT"});
    let header_b64 = b64url(header.to_string().as_bytes());
    let payload_b64 = b64url(claims.to_string().as_bytes());
    let signing_input = format!("{header_b64}.{payload_b64}");

    let sig = match args.algorithm.as_str() {
        "HS256" => {
            let mut mac =
                Hmac::<Sha256>::new_from_slice(args.key.as_bytes()).map_err(|e| anyhow!("{e}"))?;
            mac.update(signing_input.as_bytes());
            mac.finalize().into_bytes().to_vec()
        }
        "HS384" => {
            let mut mac =
                Hmac::<Sha384>::new_from_slice(args.key.as_bytes()).map_err(|e| anyhow!("{e}"))?;
            mac.update(signing_input.as_bytes());
            mac.finalize().into_bytes().to_vec()
        }
        "HS512" => {
            let mut mac =
                Hmac::<Sha512>::new_from_slice(args.key.as_bytes()).map_err(|e| anyhow!("{e}"))?;
            mac.update(signing_input.as_bytes());
            mac.finalize().into_bytes().to_vec()
        }
        other => {
            return Err(anyhow!(
                "unsupported algorithm: {other} (use HS256, HS384, HS512)"
            ))
        }
    };
    let token = format!("{signing_input}.{}", b64url(&sig));

    if json {
        println!(
            "{}",
            serde_json::to_string_pretty(&serde_json::json!({"token": token}))?
        );
    } else {
        println!("{token}");
    }
    Ok(())
}
