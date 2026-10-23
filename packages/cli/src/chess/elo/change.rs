use super::internal;
use anyhow::{anyhow, Result};
use clap::Args;
use serde_json::json;

#[derive(Args)]
pub struct ChangeArgs {
    /// Your current rating
    #[arg(long = "player-rating")]
    #[arg(required = true)]
    pub player_rating: f64,
    /// Opponent's rating
    #[arg(long = "opponent-rating")]
    #[arg(required = true)]
    pub opponent_rating: f64,
    /// Result: win, draw, or loss
    #[arg(long)]
    #[arg(required = true)]
    pub result: String,
    /// K-factor
    #[arg(long = "k-factor", default_value_t = 20.0)]
    pub k_factor: f64,
    /// Output in JSON format
    #[arg(long, short = 'j', global = true)]
    pub json: bool,
}

pub fn run(args: &ChangeArgs) -> Result<()> {
    let score = internal::result_to_score(&args.result)
        .map_err(|_| anyhow!("invalid result {:?}; use win/draw/loss", args.result))?;
    let (delta, new_rating) = internal::rating_change(
        args.player_rating,
        args.opponent_rating,
        score,
        args.k_factor,
    );
    let exp = internal::expected_score(args.player_rating, args.opponent_rating);
    if args.json {
        println!(
            "{}",
            serde_json::to_string_pretty(&json!({
                "player_rating": args.player_rating,
                "opponent_rating": args.opponent_rating,
                "result": args.result,
                "k_factor": args.k_factor,
                "expected_score": exp,
                "rating_change": delta,
                "new_rating": new_rating,
            }))?
        );
        return Ok(());
    }
    let sign = if delta < 0.0 { "" } else { "+" };
    println!("\n♞ Rating Change");
    println!("------------------------------------------------");
    println!("Player Rating   : {:.0}", args.player_rating);
    println!("Opponent Rating : {:.0}", args.opponent_rating);
    println!("Result          : {}", args.result);
    println!("K-Factor        : {:.0}", args.k_factor);
    println!("Expected Score  : {exp:.3}");
    println!("------------------------------------------------");
    println!("Rating Change   : {sign}{delta:.1}");
    println!("New Rating      : {new_rating:.0}");
    Ok(())
}
