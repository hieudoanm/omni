use super::internal;
use anyhow::{anyhow, Result};
use clap::Args;
use serde_json::json;

#[derive(Args)]
pub struct DiffArgs {
    /// Rating difference
    #[arg(long)]
    pub difference: Option<f64>,
    /// Expected score (0-1)
    #[arg(long = "expected-score")]
    pub expected_score: Option<f64>,
    /// Output in JSON format
    #[arg(long, short = 'j', global = true)]
    pub json: bool,
}

pub fn run(args: &DiffArgs) -> Result<()> {
    let has_diff = args.difference.is_some();
    let has_exp = args.expected_score.is_some();
    if has_diff && has_exp {
        return Err(anyhow!(
            "provide only one of --difference or --expected-score"
        ));
    }
    if !has_diff && !has_exp {
        return Err(anyhow!("provide either --difference or --expected-score"));
    }
    if let Some(diff) = args.difference {
        let exp = internal::diff_to_expected(diff);
        if args.json {
            println!(
                "{}",
                serde_json::to_string_pretty(&json!({
                    "mode": "diff-to-expected",
                    "rating_difference": diff,
                    "expected_score": exp,
                    "expected_pct": exp * 100.0,
                }))?
            );
            return Ok(());
        }
        println!("\n♞ Rating Difference → Expected Score");
        println!("------------------------------------------------");
        println!("Rating Difference : {diff:.0}");
        println!("Expected Score    : {exp:.3}");
        println!("Expected %        : {:.1}%", exp * 100.0);
        return Ok(());
    }
    let exp_score = args.expected_score.unwrap_or(0.0);
    if exp_score <= 0.0 || exp_score >= 1.0 {
        return Err(anyhow!(
            "expected score must be between 0 and 1 (exclusive)"
        ));
    }
    let d = internal::expected_to_diff(exp_score);
    if args.json {
        println!(
            "{}",
            serde_json::to_string_pretty(&json!({
                "mode": "expected-to-diff",
                "expected_score": exp_score,
                "rating_difference": d.round(),
            }))?
        );
        return Ok(());
    }
    let sign = if d < 0.0 { "" } else { "+" };
    println!("\n♞ Expected Score → Rating Difference");
    println!("------------------------------------------------");
    println!("Expected Score    : {exp_score:.3}");
    println!("Rating Difference : {sign}{d:.0}");
    Ok(())
}
