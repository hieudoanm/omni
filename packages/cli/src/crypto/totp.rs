use anyhow::{anyhow, Result};
use clap::Args;
use hmac::{Hmac, KeyInit, Mac};
use sha1::Sha1;
use std::io::Write;

#[derive(Args)]
pub struct TotpArgs {
    /// Base32 secret
    #[arg(long, short = 's', default_value = "")]
    pub secret: String,
    /// Time step in seconds
    #[arg(long, default_value_t = 30)]
    pub step: u64,
    /// Number of digits (6 or 8)
    #[arg(long, default_value_t = 6)]
    pub digits: u32,
    /// Time in RFC3339 format (for testing)
    #[arg(long, default_value = "")]
    pub time: String,
}

pub fn run(args: &TotpArgs, json: bool) -> Result<()> {
    let mut secret_str = args.secret.clone();
    if secret_str.is_empty() {
        print!("Secret: ");
        let _ = std::io::stdout().flush();
        std::io::stdin().read_line(&mut secret_str)?;
    }
    let secret_str = secret_str.trim().to_uppercase().replace(' ', "");
    let mut secret = secret_str.clone();
    let pad = (8 - secret.len() % 8) % 8;
    if pad > 0 {
        secret.push_str(&"=".repeat(pad));
    }
    let key =
        data_encoding_base32_decode(&secret).ok_or_else(|| anyhow!("invalid Base32 secret"))?;

    let t = if args.time.is_empty() {
        chrono::Utc::now()
    } else {
        chrono::DateTime::parse_from_rfc3339(&args.time)
            .map_err(|_| anyhow!("invalid time (use RFC3339)"))?
            .with_timezone(&chrono::Utc)
    };

    let counter = t.timestamp() as u64 / args.step;
    let counter_bytes = counter.to_be_bytes();

    let mut mac = Hmac::<Sha1>::new_from_slice(&key).map_err(|e| anyhow!("{e}"))?;
    mac.update(&counter_bytes);
    let hash = mac.finalize().into_bytes();

    let offset = (hash[hash.len() - 1] & 0x0f) as usize;
    let code = (u32::from_be_bytes([
        hash[offset],
        hash[offset + 1],
        hash[offset + 2],
        hash[offset + 3],
    ]) & 0x7fffffff)
        % 10u32.pow(args.digits);
    let code_str = format!("{code:0width$}", width = args.digits as usize);
    let remaining = args.step - (t.timestamp() as u64 % args.step);

    if json {
        println!(
            "{}",
            serde_json::to_string_pretty(&serde_json::json!({
                "code": code_str, "step": args.step,
                "remaining": remaining, "time": t.to_rfc3339(),
            }))?
        );
    } else {
        println!("{code_str}");
    }
    Ok(())
}

fn data_encoding_base32_decode(s: &str) -> Option<Vec<u8>> {
    // RFC 4648 base32 decode (Go base32.StdEncoding)
    let mut out = Vec::new();
    let mut buf: u32 = 0;
    let mut bits = 0;
    for c in s.chars() {
        if c == '=' {
            break;
        }
        let v = match c {
            'A'..='Z' => c as u32 - 'A' as u32,
            '2'..='7' => c as u32 - '2' as u32 + 26,
            _ => return None,
        };
        buf = (buf << 5) | v;
        bits += 5;
        if bits >= 8 {
            bits -= 8;
            out.push((buf >> bits) as u8);
        }
    }
    Some(out)
}
