use super::{
    calculate_tax, clamp_insurance_base, insurance_rate_total, print_json, solve_gross_from_net,
    DEPENDENT_DEDUCTION, PERSONAL_DEDUCTION,
};
use anyhow::{anyhow, Result};
use clap::Args;
use serde_json::json;

#[derive(Args)]
pub struct TaxArgs {
    /// Salary mode (gross or net)
    #[arg(long, short = 'm', default_value = "gross")]
    pub mode: String,
    /// Period (monthly or annual)
    #[arg(long, short = 'p', default_value = "monthly")]
    pub period: String,
    /// Income amount in VND
    #[arg(long, default_value_t = 0.0)]
    pub income: f64,
    /// Number of dependents
    #[arg(long, short = 'd', default_value_t = 0)]
    pub dependents: i64,
    /// Include insurance deductions
    #[arg(long, default_value_t = true)]
    pub insurance: bool,
    /// Output in JSON format
    #[arg(long)]
    pub json: bool,
    /// Export to CSV file
    #[arg(long)]
    pub csv: bool,
}

pub fn run(args: &TaxArgs, json_global: bool) -> Result<()> {
    let mode = args.mode.to_lowercase();
    let mode = match mode.as_str() {
        "gross" | "" => "gross",
        "net" => "net",
        other => return Err(anyhow!("invalid mode: {other:?} (use gross or net)")),
    };
    let period = args.period.to_lowercase();
    let period = match period.as_str() {
        "monthly" | "" => "monthly",
        "annual" => "annual",
        other => return Err(anyhow!("invalid period: {other:?} (use monthly or annual)")),
    };
    let json_out = json_global || args.json;

    if args.income <= 0.0 {
        return Err(anyhow!("--income must be greater than 0"));
    }

    let gross = if mode == "gross" {
        if period == "annual" {
            args.income / 12.0
        } else {
            args.income
        }
    } else {
        solve_gross_from_net(args.income, args.dependents, args.insurance)
    };

    let base = clamp_insurance_base(gross, args.insurance);
    let emp_ins = base * insurance_rate_total();
    let deductions = PERSONAL_DEDUCTION + args.dependents as f64 * DEPENDENT_DEDUCTION + emp_ins;
    let taxable = (gross - deductions).max(0.0);
    let (breakdown, tax) = calculate_tax(taxable);
    let net = gross - emp_ins - tax;

    if json_out {
        // Go marshals TaxBreakdown structs with no json tags: keys Rate/Taxable/Tax.
        return print_json(&json!({
            "gross": gross, "net": net, "tax": tax, "insurance": emp_ins,
            "dependents": args.dependents, "deductions": deductions,
            "taxable": taxable,
            "breakdown": breakdown.iter().map(|&(rate, apply, tax)| json!({
                "Rate": rate, "Taxable": apply, "Tax": tax,
            })).collect::<Vec<_>>(),
            "mode": mode, "period": period,
        }));
    }

    if args.csv {
        let content = format!(
            "Gross,{}\nNet,{}\nTax,{}\nInsurance,{}\nDependents,{}\nDeductions,{}\nTaxable Income,{}\n",
            fmt0(gross),
            fmt0(net),
            fmt0(tax),
            fmt0(emp_ins),
            args.dependents,
            fmt0(deductions),
            fmt0(taxable),
        );
        std::fs::write("pit-vietnam.csv", content)?;
        println!("Exported to pit-vietnam.csv");
        return Ok(());
    }

    println!("Gross: {:.0} VND", gross);
    println!("Net:   {:.0} VND", net);
    println!("Tax:   {:.0} VND\n", tax);
    println!("Breakdown:");
    for &(rate, _apply, tax) in &breakdown {
        println!("  {:.0}%  →  {:.0} VND", rate * 100.0, tax);
    }
    Ok(())
}

fn fmt0(v: f64) -> String {
    format!("{v:.0}")
}
