use super::internal;
use anyhow::{anyhow, Result};
use clap::Args;
use serde_json::json;

#[derive(Args)]
pub struct TprArgs {
    /// Comma-separated opponent ratings
    #[arg(long)]
    #[arg(required = true)]
    pub ratings: String,
    /// Your total score
    #[arg(long)]
    #[arg(required = true)]
    pub score: f64,
    /// Total number of games
    #[arg(long)]
    #[arg(required = true)]
    pub games: usize,
    /// Output in JSON format
    #[arg(long, short = 'j', global = true)]
    pub json: bool,
}

pub fn run(args: &TprArgs) -> Result<()> {
    let ratings = internal::parse_floats(&args.ratings);
    if ratings.is_empty() {
        return Err(anyhow!("--ratings is required (comma-separated)"));
    }
    let mut games = args.games;
    if games > ratings.len() {
        games = ratings.len();
    }
    if args.score < 0.0 || args.score > games as f64 {
        return Err(anyhow!("score must be between 0 and {games}"));
    }
    let (avg, tpr) = internal::performance_rating(&ratings, args.score, games);
    if args.json {
        println!(
            "{}",
            serde_json::to_string_pretty(&json!({
                "opponent_ratings": ratings,
                "score": args.score,
                "games": games,
                "avg_opponent_rating": avg,
                "tpr": tpr.round(),
            }))?
        );
        return Ok(());
    }
    println!("\n♞ Tournament Performance Rating");
    println!("------------------------------------------------");
    println!("Opponent Ratings  : {ratings:?}");
    println!("Score             : {:.0}/{games}", args.score);
    println!("Avg Opponent      : {avg:.0}");
    println!("------------------------------------------------");
    println!("TPR               : {:.0}", tpr.round());
    Ok(())
}
