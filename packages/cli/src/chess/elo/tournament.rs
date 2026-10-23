use super::internal;
use anyhow::{anyhow, Result};
use clap::Args;
use serde_json::json;

#[derive(Args)]
pub struct TournamentArgs {
    /// Starting rating before the tournament
    #[arg(long = "starting-rating")]
    #[arg(required = true)]
    pub starting_rating: f64,
    /// K-factor
    #[arg(long = "k-factor", default_value_t = 20.0)]
    pub k_factor: f64,
    /// Comma-separated opponent ratings
    #[arg(long)]
    #[arg(required = true)]
    pub opponents: String,
    /// Comma-separated results: win/draw/loss
    #[arg(long)]
    #[arg(required = true)]
    pub results: String,
    /// Output in JSON format
    #[arg(long, short = 'j', global = true)]
    pub json: bool,
}

pub fn run(args: &TournamentArgs) -> Result<()> {
    let opp_ratings = internal::parse_floats(&args.opponents);
    let results: Vec<String> = args
        .results
        .split(',')
        .map(|r| r.trim().to_string())
        .collect();
    if opp_ratings.is_empty() {
        return Err(anyhow!("--opponents is required (comma-separated ratings)"));
    }
    if results.len() != opp_ratings.len() {
        return Err(anyhow!(
            "--results must have the same number of entries as --opponents"
        ));
    }
    let (games, total_delta) =
        internal::tournament_games(args.starting_rating, args.k_factor, &opp_ratings, &results);
    let final_rating = args.starting_rating + total_delta;
    if args.json {
        let json_games: Vec<_> = games
            .iter()
            .map(|g| {
                json!({
                    "opponent": g.opponent,
                    "result": g.result,
                    "score": g.score,
                    "expected": g.expected,
                    "rating_change": g.rating_change,
                })
            })
            .collect();
        println!(
            "{}",
            serde_json::to_string_pretty(&json!({
                "starting_rating": args.starting_rating,
                "k_factor": args.k_factor,
                "games": json_games,
                "total_change": total_delta,
                "final_rating": final_rating,
            }))?
        );
        return Ok(());
    }
    println!("\n♞ Tournament Rating Change");
    println!("------------------------------------------------");
    println!("Starting Rating : {:.0}", args.starting_rating);
    println!("K-Factor        : {:.0}", args.k_factor);
    println!();
    println!(
        "{:<4} {:<10} {:<8} {:<10} {:<10}",
        "Game", "Opponent", "Result", "Expect", "Change"
    );
    println!("{}", "-".repeat(50));
    for (i, g) in games.iter().enumerate() {
        let sign = if g.rating_change < 0.0 { "" } else { "+" };
        println!(
            "{:<4} {:<10.0} {:<8} {:<10.3} {}{:<7.1}",
            i + 1,
            g.opponent,
            g.result,
            g.expected,
            sign,
            g.rating_change
        );
    }
    println!("{}", "-".repeat(50));
    let sign = if total_delta < 0.0 { "" } else { "+" };
    println!("Total Change    : {sign}{total_delta:.1}");
    println!("Final Rating    : {final_rating:.0}");
    Ok(())
}
