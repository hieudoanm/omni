use super::internal;
use anyhow::Result;
use clap::Args;
use serde_json::json;

#[derive(Args)]
pub struct ExpectedArgs {
    /// Your current rating
    #[arg(long = "player-rating")]
    #[arg(required = true)]
    pub player_rating: f64,
    /// Opponent's rating
    #[arg(long = "opponent-rating")]
    #[arg(required = true)]
    pub opponent_rating: f64,
    /// Output in JSON format
    #[arg(long, short = 'j', global = true)]
    pub json: bool,
}

pub fn run(args: &ExpectedArgs) -> Result<()> {
    let expected = internal::expected_score(args.player_rating, args.opponent_rating);
    if args.json {
        println!(
            "{}",
            serde_json::to_string_pretty(&json!({
                "player_rating": args.player_rating,
                "opponent_rating": args.opponent_rating,
                "expected_score": expected,
                "expected_pct": expected * 100.0,
            }))?
        );
        return Ok(());
    }
    println!("\n♞ Expected Score");
    println!("------------------------------------------------");
    println!("Player Rating   : {:.0}", args.player_rating);
    println!("Opponent Rating : {:.0}", args.opponent_rating);
    println!("------------------------------------------------");
    println!("Expected Score  : {expected:.3}");
    println!("Expected %      : {:.1}%", expected * 100.0);
    Ok(())
}
