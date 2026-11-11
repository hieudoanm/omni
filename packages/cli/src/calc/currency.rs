use super::print_json;
use crate::requests;
use anyhow::{anyhow, Result};
use clap::Args;
use serde_json::json;

#[derive(Args)]
pub struct CurrencyArgs {
    /// Source currency (default EUR)
    #[arg(long, default_value = "EUR")]
    pub from: String,
    /// Target currency (default USD)
    #[arg(long, default_value = "USD")]
    pub to: String,
    /// Amount to convert (default 1)
    #[arg(long, default_value_t = 1.0)]
    pub amount: f64,
}

pub fn run(args: &CurrencyArgs, json: bool) -> Result<()> {
    let url = format!(
        "https://api.frankfurter.app/latest?base={}&symbols={}",
        args.from, args.to
    );
    let body = requests::get(&url).map_err(|e| anyhow!("fetch error: {e}"))?;
    let response: serde_json::Value =
        serde_json::from_slice(&body).map_err(|e| anyhow!("parse error: {e}"))?;
    let rate = response
        .get("rates")
        .and_then(|r| r.get(&args.to))
        .and_then(|v| v.as_f64())
        .ok_or_else(|| anyhow!("no rate found for {}", args.to))?;
    let date = response
        .get("date")
        .and_then(|d| d.as_str())
        .unwrap_or("")
        .to_string();
    let converted = args.amount * rate;
    if json {
        return print_json(&json!({
            "from": args.from, "to": args.to, "amount": args.amount,
            "rate": rate, "result": converted, "date": date,
        }));
    }
    println!(
        "{:.2} {} = {:.2} {} (rate: {:.6})",
        args.amount, args.from, converted, args.to, rate
    );
    Ok(())
}
