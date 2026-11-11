use super::print_json;
use anyhow::{anyhow, Result};
use clap::Args;
use serde_json::json;

#[derive(Args)]
pub struct StatsArgs {
    /// Comma-separated numbers
    #[arg(long, short = 'v', value_delimiter = ',')]
    pub values: Vec<String>,
}

pub fn run(args: &StatsArgs, json: bool) -> Result<()> {
    let mut nums: Vec<f64> = Vec::with_capacity(args.values.len());
    for s in &args.values {
        let v: f64 = s
            .trim()
            .parse()
            .map_err(|e| anyhow!("invalid number {s:?}: {e}"))?;
        nums.push(v);
    }
    nums.sort_by(|a, b| a.partial_cmp(b).unwrap_or(std::cmp::Ordering::Equal));
    let n = nums.len();
    let sum: f64 = nums.iter().sum();
    let mean = sum / n as f64;
    let variance_sum: f64 = nums.iter().map(|v| (v - mean) * (v - mean)).sum();
    let stddev = (variance_sum / n as f64).sqrt();
    let mut median = nums[n / 2];
    if n.is_multiple_of(2) {
        median = (nums[n / 2 - 1] + nums[n / 2]) / 2.0;
    }
    if json {
        return print_json(&json!({
            "count": n, "min": nums[0], "max": nums[n - 1], "sum": sum,
            "mean": mean, "median": median, "stddev": stddev,
        }));
    }
    println!("count:  {n}");
    println!("min:    {}", fmt_g(nums[0]));
    println!("max:    {}", fmt_g(nums[n - 1]));
    println!("sum:    {}", fmt_g(sum));
    println!("mean:   {}", fmt_g(mean));
    println!("median: {}", fmt_g(median));
    println!("stddev: {}", fmt_g(stddev));
    Ok(())
}

/// Go's %g formatting: shortest representation that round-trips.
fn fmt_g(v: f64) -> String {
    let s = format!("{v}");
    // Rust Display already produces shortest round-trip; strip trailing .0 for integers
    if s.ends_with(".0") {
        s[..s.len() - 2].to_string()
    } else {
        s
    }
}
