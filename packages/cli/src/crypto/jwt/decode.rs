use anyhow::{anyhow, Result};
use base64::Engine;
use clap::Args;
use std::io::Write;

#[derive(Args)]
pub struct DecodeArgs {
    /// JWT token to decode
    #[arg(long, short = 't', default_value = "")]
    pub token: String,
}

fn b64url_decode(s: &str) -> Result<Vec<u8>> {
    base64::engine::general_purpose::URL_SAFE_NO_PAD
        .decode(s)
        .map_err(|e| anyhow!("{e}"))
}

pub fn run(args: &DecodeArgs, json: bool) -> Result<()> {
    let mut token = args.token.clone();
    if token.is_empty() {
        print!("Token: ");
        let _ = std::io::stdout().flush();
        std::io::stdin().read_line(&mut token)?;
    }
    let token = token.trim().to_string();

    // splitJWT: header and payload segments
    let mut parts = token.splitn(3, '.');
    let (Some(h), Some(p)) = (parts.next(), parts.next()) else {
        return Err(anyhow!("parse failed: malformed token"));
    };
    if h.is_empty() || p.is_empty() {
        return Err(anyhow!("parse failed: malformed token"));
    }

    let header_data = b64url_decode(h).map_err(|_| anyhow!("parse failed: invalid header"))?;
    let payload_data = b64url_decode(p).map_err(|_| anyhow!("parse failed: invalid payload"))?;

    let header_json: serde_json::Value =
        serde_json::from_slice(&header_data).unwrap_or_else(|_| {
            serde_json::Value::String(String::from_utf8_lossy(&header_data).to_string())
        });
    let payload_json: serde_json::Value =
        serde_json::from_slice(&payload_data).map_err(|e| anyhow!("parse failed: {e}"))?;

    if json {
        println!(
            "{}",
            serde_json::to_string_pretty(&serde_json::json!({
                "header": header_json, "payload": payload_json,
            }))?
        );
    } else {
        println!("Header:\n{}\n", String::from_utf8_lossy(&header_data));
        println!("Payload:");
        if let serde_json::Value::Object(map) = &payload_json {
            for (k, v) in map {
                println!("  {k}: {v}");
            }
        }
    }
    Ok(())
}
