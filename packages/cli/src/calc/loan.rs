use super::{calc_payment, print_json};
use anyhow::Result;
use clap::Args;
use serde_json::json;

#[derive(Args)]
pub struct LoanArgs {
    /// Loan principal amount
    #[arg(long, short = 'p', default_value_t = 0.0)]
    pub principal: f64,
    /// Annual interest rate (percentage)
    #[arg(long, short = 'r', default_value_t = 0.0)]
    pub rate: f64,
    /// Loan term in years
    #[arg(long, short = 'y', default_value_t = 0.0)]
    pub years: f64,
}

pub fn run(args: &LoanArgs, json: bool) -> Result<()> {
    let payment = calc_payment(args.principal, args.rate, args.years);
    let n = args.years * 12.0;
    let total_payment = payment * n;
    let total_interest = total_payment - args.principal;
    let r = args.rate / 100.0 / 12.0;

    if json {
        let mut schedule = Vec::new();
        let mut balance = args.principal;
        for i in 1..=(n as i64).min(12) {
            let interest = balance * r;
            let principal_paid = payment - interest;
            balance -= principal_paid;
            schedule.push(json!({
                "month": i, "payment": payment, "interest": interest, "balance": balance,
            }));
        }
        return print_json(&json!({
            "principal": args.principal, "rate": args.rate, "years": args.years,
            "monthly": payment, "total_paid": total_payment,
            "total_interest": total_interest, "schedule": schedule,
        }));
    }

    println!("=== Loan Amortization ===");
    println!("Principal:     {:>15.2}", args.principal);
    println!("Annual rate:   {:>15.2}%", args.rate);
    println!("Years:         {:>15.0}", args.years);
    println!("Monthly:       {:>15.2}", payment);
    println!("Total paid:    {:>15.2}", total_payment);
    println!("Total interest:{:>15.2}", total_interest);
    println!();
    println!(
        "{:<6} {:>12} {:>12} {:>12}",
        "Month", "Payment", "Interest", "Balance"
    );
    println!("------   ------------   ------------   ------------");
    let mut balance = args.principal;
    for i in 1..=(n as i64).min(12) {
        let interest = balance * r;
        let principal_paid = payment - interest;
        balance -= principal_paid;
        println!(
            "{:<6} {:>12.2} {:>12.2} {:>12.2}",
            i, payment, interest, balance
        );
    }
    if n > 12.0 {
        println!("... ({:.0} more months)", n - 12.0);
    }
    Ok(())
}
