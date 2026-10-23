use super::print_json;
use anyhow::Result;
use clap::Args;
use rand::RngExt;
use serde_json::json;

#[derive(Args)]
pub struct RandomArgs {
    /// Minimum value
    #[arg(long, short = 'm', default_value_t = 1.0)]
    pub min: f64,
    /// Maximum value
    #[arg(long, short = 'x', default_value_t = 100.0)]
    pub max: f64,
    /// Number of values
    #[arg(long, short = 'n', default_value_t = 1)]
    pub count: i64,
}

pub fn run(args: &RandomArgs, json: bool) -> Result<()> {
    let count = args.count.max(1) as usize;
    let mut rng = rand::rng();
    let nums: Vec<f64> = (0..count)
        .map(|_| args.min + rng.random::<f64>() * (args.max - args.min))
        .collect();
    if json {
        return print_json(&json!({
            "min": args.min, "max": args.max, "count": count, "values": nums,
        }));
    }
    for v in nums {
        println!("{v}");
    }
    Ok(())
}
