use super::print_json;
use anyhow::Result;
use clap::Args;
use num_bigint::BigUint;
use serde_json::json;

#[derive(Args)]
pub struct FactorialArgs {
    /// Non-negative integer
    #[arg(long, short = 'n', default_value_t = 0)]
    pub number: i64,
}

pub fn run(args: &FactorialArgs, json: bool) -> Result<()> {
    let n = args.number;
    if n < 0 {
        anyhow::bail!("factorial of negative number is undefined");
    }
    // big.Int.MulRange(1, n): product 1..=n (empty product = 1 for n=0)
    let mut result = BigUint::from(1u32);
    for i in 2..=n {
        result *= BigUint::from(i as u64);
    }
    let result_str = result.to_string();
    if json {
        return print_json(&json!({"n": n, "factorial": result_str}));
    }
    println!("{result_str}");
    Ok(())
}
