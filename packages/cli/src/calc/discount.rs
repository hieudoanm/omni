use super::print_json;
use anyhow::Result;
use clap::Args;
use serde_json::json;

#[derive(Args)]
pub struct DiscountArgs {
    /// Original price
    #[arg(long, short = 'o', default_value_t = 0.0)]
    pub original: f64,
    /// Discount percentage
    #[arg(long, short = 'p', default_value_t = 0.0)]
    pub percent: f64,
}

pub fn run(args: &DiscountArgs, json: bool) -> Result<()> {
    let discount = args.original * args.percent / 100.0;
    let final_price = args.original - discount;
    if json {
        return print_json(&json!({
            "original": args.original,
            "percent": args.percent,
            "discount": discount,
            "final_price": final_price,
        }));
    }
    println!("=== Discount Calculator ===");
    println!("Original price:  {:>12.2}", args.original);
    println!("Discount:        {:>12.2}%", args.percent);
    println!("You save:        {:>12.2}", discount);
    println!("Final price:     {:>12.2}", final_price);
    Ok(())
}
