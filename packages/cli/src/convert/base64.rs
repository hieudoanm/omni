use crate::convert::internal::{resolve_text, write_json};
use ::base64::{engine::general_purpose::STANDARD, Engine as _};
use anyhow::Result;
use clap::{Args as ClapArgs, Subcommand};
use serde::Serialize;
use std::fs;
use std::io::Write;

#[derive(ClapArgs)]
pub struct Base64Args {
    #[command(subcommand)]
    pub command: Option<Base64Command>,
}

#[derive(Subcommand)]
pub enum Base64Command {
    /// Encode text/file to base64
    Encode(EncodeArgs),
    /// Decode base64 to text/file
    Decode(DecodeArgs),
}

#[derive(ClapArgs)]
pub struct EncodeArgs {
    /// Text to encode
    #[arg()]
    pub text: Option<String>,
    /// File to encode (reads raw bytes to base64)
    #[arg(long, short = 'f')]
    pub file: Option<String>,
    /// Write output to file instead of stdout
    #[arg(long, short = 'o')]
    pub output: Option<String>,
}

#[derive(ClapArgs)]
pub struct DecodeArgs {
    /// Base64 text to decode
    #[arg()]
    pub text: Option<String>,
    /// File containing base64 to decode
    #[arg(long, short = 'f')]
    pub file: Option<String>,
    /// Write decoded output to file instead of stdout
    #[arg(long, short = 'o')]
    pub output: Option<String>,
}

#[derive(Serialize)]
struct OutputResult {
    output: String,
}

pub fn run(args: &Base64Args, json: bool) -> Result<()> {
    match &args.command {
        Some(Base64Command::Encode(a)) => encode(a, json),
        Some(Base64Command::Decode(a)) => decode(a, json),
        None => {
            let mut cmd = <Base64Args as ClapArgs>::augment_args(clap::Command::new("base64"));
            let _ = cmd.print_help();
            Ok(())
        }
    }
}

fn encode(args: &EncodeArgs, json: bool) -> Result<()> {
    let data = match &args.file {
        Some(f) => fs::read(f)?,
        None => resolve_text(args.text.as_deref())?.into_bytes(),
    };
    let encoded = STANDARD.encode(&data);
    if let Some(out) = &args.output {
        fs::write(out, encoded)?;
        return Ok(());
    }
    if json {
        return write_json(&OutputResult { output: encoded });
    }
    println!("{encoded}");
    Ok(())
}

fn strip_data_url(s: &str) -> &str {
    match s.find("base64,") {
        Some(idx) => &s[idx + 7..],
        None => s,
    }
}

fn decode_base64(input: &[u8]) -> Result<Vec<u8>> {
    let raw = String::from_utf8_lossy(input);
    let cleaned: String = strip_data_url(raw.trim())
        .chars()
        .filter(|c| *c != '\n')
        .collect();
    Ok(STANDARD.decode(cleaned.trim())?)
}

fn decode(args: &DecodeArgs, json: bool) -> Result<()> {
    let data = match &args.file {
        Some(f) => fs::read(f)?,
        None => resolve_text(args.text.as_deref())?.into_bytes(),
    };
    let decoded = decode_base64(&data)?;
    if let Some(out) = &args.output {
        fs::write(out, decoded)?;
        return Ok(());
    }
    if json {
        return write_json(&OutputResult {
            output: String::from_utf8_lossy(&decoded).into_owned(),
        });
    }
    let mut stdout = std::io::stdout();
    stdout.write_all(&decoded)?;
    stdout.write_all(b"\n")?;
    stdout.flush()?;
    Ok(())
}
