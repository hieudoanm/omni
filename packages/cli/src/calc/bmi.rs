use super::print_json;
use anyhow::Result;
use clap::Args;
use serde_json::json;

// -h is height's shorthand (cobra parity); --help is provided manually below.
#[derive(Args)]
#[command(disable_help_flag = true)]
pub struct BmiArgs {
    /// Weight in kg
    #[arg(long, short = 'w', default_value_t = 0.0)]
    pub weight: f64,
    /// Height in cm
    #[arg(long, short = 'h', default_value_t = 0.0)]
    pub height: f64,
    /// Print help
    #[arg(long)]
    pub help: bool,
}

fn bmi_category(bmi: f64) -> &'static str {
    if bmi < 18.5 {
        "Underweight"
    } else if bmi < 25.0 {
        "Normal"
    } else if bmi < 30.0 {
        "Overweight"
    } else {
        "Obese"
    }
}

pub fn run(args: &BmiArgs, json: bool) -> Result<()> {
    if args.help {
        let mut cmd = <BmiArgs as clap::Args>::augment_args(clap::Command::new("bmi"));
        let _ = cmd.print_help();
        return Ok(());
    }
    let height_m = args.height / 100.0;
    let bmi = args.weight / (height_m * height_m);
    let cat = bmi_category(bmi);
    if json {
        return print_json(&json!({
            "weight": args.weight, "height": args.height,
            "bmi": bmi, "category": cat,
        }));
    }
    println!("=== BMI Calculator ===");
    println!("Weight:        {:>12.1} kg", args.weight);
    println!("Height:        {:>12.1} cm", args.height);
    println!("BMI:           {:>12.1}", bmi);
    println!("Category:      {:>12}", cat);
    Ok(())
}
