use super::{gcd, print_json};
use anyhow::Result;
use clap::Args;
use serde_json::json;

#[derive(Args)]
pub struct GcdArgs {
    /// First number
    #[arg(long, short = 'a', default_value_t = 0)]
    pub a: i64,
    /// Second number
    #[arg(long, short = 'b', default_value_t = 0)]
    pub b: i64,
}

pub fn run(args: &GcdArgs, json: bool) -> Result<()> {
    let result = gcd(args.a, args.b);
    if json {
        return print_json(&json!({"a": args.a, "b": args.b, "gcd": result}));
    }
    println!("{result}");
    Ok(())
}
