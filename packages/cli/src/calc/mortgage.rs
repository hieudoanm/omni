use super::{calc_payment, print_json};
use anyhow::Result;
use clap::Args;
use serde_json::json;

#[derive(Args)]
pub struct MortgageArgs {
    /// Loan principal
    #[arg(long, short = 'p', default_value_t = 0.0)]
    pub principal: f64,
    /// Annual interest rate (percentage)
    #[arg(long, short = 'r', default_value_t = 0.0)]
    pub rate: f64,
    /// Loan term in years
    #[arg(long, short = 'y', default_value_t = 30.0)]
    pub years: f64,
    /// Annual property taxes
    #[arg(long, default_value_t = 0.0)]
    pub taxes: f64,
    /// Annual insurance
    #[arg(long, default_value_t = 0.0)]
    pub insurance: f64,
    /// Annual PMI
    #[arg(long, default_value_t = 0.0)]
    pub pmi: f64,
}

pub fn run(args: &MortgageArgs, json: bool) -> Result<()> {
    let n = args.years * 12.0;
    let payment = calc_payment(args.principal, args.rate, args.years);
    let monthly_taxes = args.taxes / 12.0;
    let monthly_insurance = args.insurance / 12.0;
    let monthly_pmi = args.pmi / 12.0;
    let total_monthly = payment + monthly_taxes + monthly_insurance + monthly_pmi;
    let total_paid = total_monthly * n;
    let total_interest =
        total_paid - args.principal - monthly_taxes * n - monthly_insurance * n - monthly_pmi * n;

    if json {
        return print_json(&json!({
            "principal": args.principal, "rate": args.rate, "years": args.years,
            "monthly_payment": payment, "monthly_taxes": monthly_taxes,
            "monthly_insurance": monthly_insurance, "monthly_pmi": monthly_pmi,
            "total_monthly": total_monthly, "total_paid": total_paid,
            "total_interest": total_interest,
        }));
    }

    println!("=== Mortgage Calculator ===");
    println!("Principal:           {:>14.2}", args.principal);
    println!("Annual rate:         {:>14.2}%", args.rate);
    println!("Years:               {:>14.0}", args.years);
    println!();
    println!("Principal & Interest: {:>12.2}", payment);
    if args.taxes > 0.0 {
        println!("Property taxes:      {:>12.2}/mo", monthly_taxes);
    }
    if args.insurance > 0.0 {
        println!("Insurance:           {:>12.2}/mo", monthly_insurance);
    }
    if args.pmi > 0.0 {
        println!("PMI:                 {:>12.2}/mo", monthly_pmi);
    }
    println!("{}", "-".repeat(35));
    println!("Total monthly:       {:>12.2}", total_monthly);
    println!();
    println!("Total paid:          {:>14.2}", total_paid);
    println!("Total interest:      {:>14.2}", total_interest);
    Ok(())
}
