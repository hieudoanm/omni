use crate::convert::internal::{resolve_text, write_json};
use anyhow::{anyhow, Result};
use serde::Serialize;
use std::io::Write;

#[derive(clap::Args)]
pub struct Args {
    /// Text to encode or decode
    #[arg()]
    pub text: Option<String>,
    /// Decode URL
    #[arg(long, short = 'd')]
    pub decode: bool,
}

#[derive(Serialize)]
struct UrlResult {
    input: String,
    output: String,
    mode: &'static str,
}

fn is_unreserved(b: u8) -> bool {
    b.is_ascii_alphanumeric() || matches!(b, b'-' | b'_' | b'.' | b'~')
}

fn query_escape(s: &str) -> String {
    let mut out = String::with_capacity(s.len());
    for &b in s.as_bytes() {
        if is_unreserved(b) {
            out.push(b as char);
        } else if b == b' ' {
            out.push('+');
        } else {
            out.push_str(&format!("%{b:02X}"));
        }
    }
    out
}

fn hex_val(b: u8) -> Option<u8> {
    match b {
        b'0'..=b'9' => Some(b - b'0'),
        b'a'..=b'f' => Some(b - b'a' + 10),
        b'A'..=b'F' => Some(b - b'A' + 10),
        _ => None,
    }
}

fn query_unescape(s: &str) -> Result<String> {
    let bytes = s.as_bytes();
    let mut out: Vec<u8> = Vec::with_capacity(bytes.len());
    let mut i = 0;
    while i < bytes.len() {
        match bytes[i] {
            b'+' => {
                out.push(b' ');
                i += 1;
            }
            b'%' => {
                if i + 2 >= bytes.len() {
                    return Err(anyhow!("invalid URL escape"));
                }
                let hi = hex_val(bytes[i + 1]).ok_or_else(|| anyhow!("invalid URL escape"))?;
                let lo = hex_val(bytes[i + 2]).ok_or_else(|| anyhow!("invalid URL escape"))?;
                out.push(hi << 4 | lo);
                i += 3;
            }
            b => {
                out.push(b);
                i += 1;
            }
        }
    }
    Ok(String::from_utf8_lossy(&out).into_owned())
}

pub fn run(args: &Args, json: bool) -> Result<()> {
    let text = resolve_text(args.text.as_deref())?;
    if args.decode {
        let decoded = query_unescape(&text)?;
        if json {
            return write_json(&UrlResult {
                input: text,
                output: decoded,
                mode: "decode",
            });
        }
        println!("{decoded}");
    } else {
        let encoded = query_escape(&text);
        if json {
            return write_json(&UrlResult {
                input: text,
                output: encoded,
                mode: "encode",
            });
        }
        println!("{encoded}");
    }
    std::io::stdout().flush()?;
    Ok(())
}
