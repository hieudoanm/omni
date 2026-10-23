use super::{find_unit, print_json};
use anyhow::{anyhow, Result};
use clap::Args;
use serde_json::json;

#[derive(Args)]
pub struct UnitArgs {
    /// Value to convert
    #[arg(long, short = 'v', default_value_t = 0.0)]
    pub value: f64,
    /// Source unit
    #[arg(long, short = 'f', default_value = "")]
    pub from: String,
    /// Target unit
    #[arg(long, short = 't', default_value = "")]
    pub to: String,
}

pub fn run(args: &UnitArgs, json: bool) -> Result<()> {
    let Some(from_unit) = find_unit(&args.from) else {
        return Err(anyhow!("unknown unit: {}", args.from));
    };
    let Some(to_unit) = find_unit(&args.to) else {
        return Err(anyhow!("unknown unit: {}", args.to));
    };
    if from_unit.cat != to_unit.cat {
        return Err(anyhow!(
            "cannot convert {} ({}) to {} ({})",
            args.from,
            from_unit.cat,
            args.to,
            to_unit.cat
        ));
    }
    let base = from_unit.kind.to_base(args.value);
    let result = to_unit.kind.base_to_unit(base);
    if json {
        return print_json(&json!({
            "value": args.value, "from": args.from, "to": args.to,
            "result": result, "category": from_unit.cat,
        }));
    }
    println!(
        "{} {} = {} {}",
        fmt_g(args.value),
        args.from,
        fmt_g(result),
        args.to
    );
    Ok(())
}

/// Go's %g formatting.
fn fmt_g(v: f64) -> String {
    let s = format!("{v}");
    if s.ends_with(".0") {
        s[..s.len() - 2].to_string()
    } else {
        s
    }
}
