use super::internal;
use anyhow::Result;
use clap::Args;

const LOWER: &str = "abcdefghijklmnopqrstuvwxyz";
const UPPER: &str = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const DIGITS: &str = "0123456789";
const SYMBOLS: &str = "!@#$%^&*()-_=+[]{}<>?|~";
const VOWELS: &str = "aeiou";
const CONS: &str = "bcdfghjklmnpqrstvwxyz";

#[derive(Args)]
pub struct PasswdArgs {
    /// Password length
    #[arg(long, short = 'l', default_value_t = 16)]
    pub length: usize,
    /// Number of passwords
    #[arg(long, short = 'n', default_value_t = 1)]
    pub count: usize,
    /// Include digits
    #[arg(long, short = 'd', default_value_t = true)]
    pub digits: bool,
    /// Include symbols
    #[arg(long, short = 's', default_value_t = false)]
    pub symbols: bool,
    /// Exclude uppercase letters
    #[arg(long)]
    pub no_upper: bool,
    /// Generate numeric PIN
    #[arg(long)]
    pub pin: bool,
    /// Copy to clipboard (first password only)
    #[arg(long)]
    pub clip: bool,
    /// Generate pronounceable password
    #[arg(long)]
    pub pronounceable: bool,
}

fn pick(charset: &str) -> Result<char> {
    let bytes = charset.as_bytes();
    Ok(bytes[internal::rand_index(bytes.len())?] as char)
}

fn gen(
    length: usize,
    digits: bool,
    symbols: bool,
    no_upper: bool,
    pin: bool,
    pronounceable: bool,
) -> Result<String> {
    if pin {
        return (0..length).map(|_| pick(DIGITS)).collect();
    }
    if pronounceable {
        let mut out = String::new();
        while out.len() < length {
            out.push(pick(CONS)?);
            out.push(pick(VOWELS)?);
        }
        return Ok(out.chars().take(length).collect());
    }
    let mut charset = LOWER.to_string();
    if !no_upper {
        charset.push_str(UPPER);
    }
    if digits {
        charset.push_str(DIGITS);
    }
    if symbols {
        charset.push_str(SYMBOLS);
    }
    (0..length).map(|_| pick(&charset)).collect()
}

pub fn run(args: &PasswdArgs, json: bool) -> Result<()> {
    let mut passwords = Vec::new();
    for _ in 0..args.count {
        passwords.push(gen(
            args.length,
            args.digits,
            args.symbols,
            args.no_upper,
            args.pin,
            args.pronounceable,
        )?);
    }
    if json {
        let ty = if args.pin {
            "pin"
        } else if args.pronounceable {
            "pronounceable"
        } else {
            "random"
        };
        println!(
            "{}",
            serde_json::to_string_pretty(&serde_json::json!({
                "passwords": passwords, "count": args.count,
                "length": args.length, "type": ty,
            }))?
        );
    } else {
        for (i, p) in passwords.iter().enumerate() {
            if args.clip && i == passwords.len() - 1 {
                // Go's --clip prints without newline (clipboard lib was a no-op stub)
                print!("{p}");
            } else {
                println!("{p}");
            }
        }
    }
    Ok(())
}
