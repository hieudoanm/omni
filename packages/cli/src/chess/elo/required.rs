use super::internal;
use anyhow::{anyhow, Result};
use clap::Args;
use serde_json::json;

#[derive(Args)]
pub struct RequiredArgs {
    /// Average opponent rating
    #[arg(long = "avg-opponent-rating")]
    #[arg(required = true)]
    pub avg_opponent_rating: f64,
    /// Number of games
    #[arg(long)]
    #[arg(required = true)]
    pub games: f64,
    /// Target performance rating
    #[arg(long = "target-tpr")]
    #[arg(required = true)]
    pub target_tpr: f64,
    /// Output in JSON format
    #[arg(long, short = 'j', global = true)]
    pub json: bool,
}

pub fn run(args: &RequiredArgs) -> Result<()> {
    if args.games <= 0.0 {
        return Err(anyhow!("--games must be positive"));
    }
    let (score, pct) =
        internal::required_score(args.avg_opponent_rating, args.games, args.target_tpr);
    let rs = (score * 10.0).round() / 10.0;
    let rp = (pct * 10.0).round() / 10.0;
    if args.json {
        println!(
            "{}",
            serde_json::to_string_pretty(&json!({
                "avg_opponent_rating": args.avg_opponent_rating,
                "games": args.games,
                "target_tpr": args.target_tpr,
                "required_score": rs,
                "required_pct": rp,
            }))?
        );
        return Ok(());
    }
    println!("\n♞ Required Score");
    println!("------------------------------------------------");
    println!("Avg Opponent Rating : {:.0}", args.avg_opponent_rating);
    println!("Games               : {:.0}", args.games);
    println!("Target TPR          : {:.0}", args.target_tpr);
    println!("------------------------------------------------");
    println!("Required Score      : {rs:.1}");
    println!("Required %          : {rp:.1}%");
    Ok(())
}
