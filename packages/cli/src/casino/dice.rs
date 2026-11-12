use anyhow::Result;
use clap::Args;
use rand::RngExt;

#[derive(Args)]
pub struct DiceArgs {
    /// Number of sides per die
    #[arg(long, short = 's', default_value_t = 6)]
    pub sides: u32,
    /// Number of dice to roll
    #[arg(long, short = 'n', default_value_t = 1)]
    pub count: usize,
}

pub fn run(args: &DiceArgs, json: bool) -> Result<()> {
    let mut rng = rand::rng();
    let results: Vec<u32> = (0..args.count)
        .map(|_| rng.random_range(1..=args.sides))
        .collect();
    let total: u32 = results.iter().sum();
    if json {
        println!(
            "{}",
            serde_json::to_string_pretty(&serde_json::json!({
                "results": results, "count": args.count,
                "sides": args.sides, "total": total,
            }))?
        );
    } else if args.count == 1 {
        println!("🎲 {}", results[0]);
    } else {
        println!("Rolling {}d{}:", args.count, args.sides);
        for (i, r) in results.iter().enumerate() {
            println!("  Die {}: {}", i + 1, r);
        }
        println!("\nTotal: {}", total);
    }
    Ok(())
}
