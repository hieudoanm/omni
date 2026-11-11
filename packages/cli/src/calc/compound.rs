use super::print_json;
use anyhow::Result;
use clap::Args;
use serde_json::{json, Value};

#[derive(Args)]
pub struct CompoundArgs {
    /// Initial principal amount
    #[arg(long, short = 'p', default_value_t = 0.0)]
    pub principal: f64,
    /// Annual interest rate (percentage)
    #[arg(long, short = 'r', default_value_t = 0.0)]
    pub rate: f64,
    /// Number of years
    #[arg(long, short = 'y', default_value_t = 0.0)]
    pub years: f64,
    /// Regular contribution per compounding period
    #[arg(long, short = 'c', default_value_t = 0.0)]
    pub contribute: f64,
    /// Compounding frequency: yearly, quarterly, monthly, daily
    #[arg(long, short = 'n', default_value = "yearly")]
    pub compound: String,
}

fn compounding_periods(freq: &str) -> f64 {
    match freq {
        "daily" => 365.0,
        "monthly" => 12.0,
        "quarterly" => 4.0,
        _ => 1.0,
    }
}

fn future_value(principal: f64, rate: f64, years: f64, contribute: f64, n: f64) -> (f64, f64) {
    let nt = n * years;
    let r = rate / 100.0;
    let fv_principal = principal * (1.0 + r / n).powf(nt);
    let fv_contributions = if contribute > 0.0 {
        if r == 0.0 {
            contribute * nt
        } else {
            contribute * ((1.0 + r / n).powf(nt) - 1.0) / (r / n)
        }
    } else {
        0.0
    };
    (fv_principal + fv_contributions, principal + contribute * nt)
}

fn year_breakdown(principal: f64, rate: f64, years: f64, contribute: f64, n: f64) -> Vec<Value> {
    let r = rate / 100.0;
    let mut rows = Vec::new();
    for y in 1..=years as i64 {
        let pt = n * y as f64;
        let mut fv = principal * (1.0 + r / n).powf(pt);
        let deposits = principal + contribute * n * y as f64;
        if contribute > 0.0 {
            if r > 0.0 {
                fv += contribute * ((1.0 + r / n).powf(pt) - 1.0) / (r / n);
            } else {
                fv = principal + contribute * n * y as f64;
            }
        }
        rows.push(json!({
            "year": y,
            "balance": fv,
            "interest": fv - deposits,
            "deposits": deposits,
        }));
    }
    rows
}

pub fn run(args: &CompoundArgs, json: bool) -> Result<()> {
    let n = compounding_periods(&args.compound);
    let (fv, total_deposits) =
        future_value(args.principal, args.rate, args.years, args.contribute, n);
    let total_interest = fv - total_deposits;
    if json {
        return print_json(&json!({
            "principal": args.principal,
            "rate": args.rate,
            "years": args.years,
            "compounding": args.compound,
            "contribution": args.contribute,
            "future_value": fv,
            "total_deposits": total_deposits,
            "total_interest": total_interest,
            "year_breakdown": year_breakdown(args.principal, args.rate, args.years, args.contribute, n),
        }));
    }
    let freq_label = &args.compound;
    let period_label = if args.compound == "monthly" {
        "per month".to_string()
    } else if args.compound == "daily" {
        "per day".to_string()
    } else {
        // Go: "per " + compound[:len-2] + "y"  (e.g. "yearly" -> "per yeary")
        let stripped = &args.compound[..args.compound.len().saturating_sub(2)];
        format!("per {stripped}y")
    };
    println!("=== Compound Interest Calculator ===");
    println!("Principal:         {:>15.2}", args.principal);
    println!("Annual rate:       {:>15.2}%", args.rate);
    println!("Years:             {:>15.0}", args.years);
    println!("Compounding:       {:>15}", freq_label);
    if args.contribute > 0.0 {
        println!(
            "Contribution:      {:>15.2} {}",
            args.contribute, period_label
        );
    }
    println!();
    println!(
        "{:<6} {:>14} {:>14} {:>14}",
        "Year", "Deposits", "Interest", "Balance"
    );
    println!("------   ------------   ------------   ------------");
    let r = args.rate / 100.0;
    for y in 1..=args.years as i64 {
        let pt = n * y as f64;
        let mut bal = args.principal * (1.0 + r / n).powf(pt);
        let deposits = args.principal + args.contribute * n * y as f64;
        if args.contribute > 0.0 {
            if r > 0.0 {
                bal += args.contribute * ((1.0 + r / n).powf(pt) - 1.0) / (r / n);
            } else {
                bal = args.principal + args.contribute * n * y as f64;
            }
        }
        println!(
            "{:<6} {:>14.2} {:>14.2} {:>14.2}",
            y,
            deposits,
            bal - deposits,
            bal
        );
    }
    println!();
    println!(
        "{:<6} {:>14.2} {:>14.2} {:>14.2}",
        "Total", total_deposits, total_interest, fv
    );
    Ok(())
}
