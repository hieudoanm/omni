use super::print_json;
use anyhow::{anyhow, Result};
use clap::Args;
use serde_json::json;

#[derive(Args)]
pub struct PercentArgs {
    /// Base value
    #[arg(long, short = 'v', default_value_t = 0.0)]
    pub value: f64,
    /// Calculate what % value is of this
    #[arg(long, short = 'o', default_value_t = 0.0)]
    pub of: f64,
    /// Add percentage
    #[arg(long, short = 'p', default_value_t = 0.0)]
    pub plus: f64,
    /// Subtract percentage
    #[arg(long, short = 'm', default_value_t = 0.0)]
    pub minus: f64,
}

pub fn run(args: &PercentArgs, json: bool) -> Result<()> {
    if args.of != 0.0 {
        let pct = args.value / args.of * 100.0;
        if json {
            return print_json(&json!({
                "value": args.value, "of": args.of,
                "percentage": pct, "type": "percentage_of",
            }));
        }
        println!("{:.2} is {:.2}% of {:.2}", args.value, pct, args.of);
    } else if args.plus != 0.0 {
        let result = args.value * (1.0 + args.plus / 100.0);
        if json {
            return print_json(&json!({
                "value": args.value, "change": args.plus,
                "result": result, "type": "add_percentage",
            }));
        }
        println!("{:.2} + {:.2}% = {:.2}", args.value, args.plus, result);
    } else if args.minus != 0.0 {
        let result = args.value * (1.0 - args.minus / 100.0);
        if json {
            return print_json(&json!({
                "value": args.value, "change": args.minus,
                "result": result, "type": "subtract_percentage",
            }));
        }
        println!("{:.2} - {:.2}% = {:.2}", args.value, args.minus, result);
    } else {
        return Err(anyhow!("use --of, --plus, or --minus"));
    }
    Ok(())
}
