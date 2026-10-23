use super::print_json;
use anyhow::{anyhow, Result};
use clap::Args;
use serde_json::json;

#[derive(Args)]
pub struct BaseArgs {
    /// Value to convert
    #[arg(long, short = 'v', default_value = "")]
    pub value: String,
    /// Source base (bin/oct/dec/hex)
    #[arg(long, short = 'f', default_value = "dec")]
    pub from: String,
    /// Target base (bin/oct/dec/hex)
    #[arg(long, short = 't', default_value = "hex")]
    pub to: String,
}

fn base_num(name: &str) -> Option<i32> {
    Some(match name {
        "bin" | "binary" => 2,
        "oct" | "octal" => 8,
        "dec" | "decimal" => 10,
        "hex" | "hexadecimal" => 16,
        _ => return None,
    })
}

fn base_name(n: i32) -> &'static str {
    match n {
        2 => "binary",
        8 => "octal",
        10 => "decimal",
        16 => "hexadecimal",
        _ => "",
    }
}

fn format_int(n: i64, base: i32) -> String {
    match base {
        16 => format!("{n:x}"),
        8 => format!("{n:o}"),
        2 => format!("{n:b}"),
        _ => n.to_string(),
    }
}

pub fn run(args: &BaseArgs, json: bool) -> Result<()> {
    let from_base = base_num(&args.from)
        .ok_or_else(|| anyhow!("unknown base: {} (use bin/oct/dec/hex)", args.from))?;
    let to_base = base_num(&args.to)
        .ok_or_else(|| anyhow!("unknown base: {} (use bin/oct/dec/hex)", args.to))?;
    let n = i64::from_str_radix(args.value.trim_start_matches("+"), from_base as u32)
        .or_else(|_| {
            // Go ParseInt accepts a leading sign for explicit bases.
            if let Some(rest) = args.value.strip_prefix('-') {
                i64::from_str_radix(rest, from_base as u32).map(|v| -v)
            } else {
                i64::from_str_radix(&args.value, from_base as u32)
            }
        })
        .map_err(|e| anyhow!("invalid value {:?} for base {}: {e}", args.value, args.from))?;
    let result = format_int(n, to_base);
    if json {
        return print_json(&json!({
            "value": args.value,
            "from": base_name(from_base),
            "to": base_name(to_base),
            "result": result,
        }));
    }
    println!(
        "{} ({}) = {} ({})",
        args.value,
        base_name(from_base),
        result,
        base_name(to_base)
    );
    Ok(())
}
