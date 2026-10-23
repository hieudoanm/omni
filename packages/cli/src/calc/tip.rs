use super::print_json;
use anyhow::Result;
use clap::Args;
use serde_json::json;

#[derive(Args)]
pub struct TipArgs {
    /// Bill amount
    #[arg(long, short = 'b', default_value_t = 0.0)]
    pub bill: f64,
    /// Tip percentage
    #[arg(long, short = 'p', default_value_t = 15.0)]
    pub percent: f64,
    /// Number of people splitting
    #[arg(long, short = 's', default_value_t = 1)]
    pub split: i64,
}

pub fn run(args: &TipArgs, json: bool) -> Result<()> {
    let split = args.split.max(1);
    let tip = args.bill * args.percent / 100.0;
    let total = args.bill + tip;
    let per_person = total / split as f64;
    if json {
        return print_json(&json!({
            "bill": args.bill, "tip_percent": args.percent, "tip": tip,
            "total": total, "split": split, "per_person": per_person,
        }));
    }
    println!("=== Tip Calculator ===");
    println!("Bill:          {:>12.2}", args.bill);
    println!("Tip %:          {:>11.0}%", args.percent);
    println!("Tip amount:    {:>12.2}", tip);
    println!("Total:         {:>12.2}", total);
    println!("Split:         {:>12}", split);
    println!("Per person:    {:>12.2}", per_person);
    Ok(())
}
