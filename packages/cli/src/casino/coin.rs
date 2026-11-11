use anyhow::Result;
use clap::Args;
use rand::Rng;

#[derive(Args)]
pub struct CoinArgs {
    /// Number of coin flips
    #[arg(long, short = 'n', default_value_t = 1)]
    pub count: usize,
}

pub fn run(args: &CoinArgs, json: bool) -> Result<()> {
    let mut results = Vec::with_capacity(args.count);
    let (mut heads, mut tails) = (0usize, 0usize);
    for _ in 0..args.count {
        if rand::rng().random::<bool>() {
            results.push("Heads");
            heads += 1;
        } else {
            results.push("Tails");
            tails += 1;
        }
    }
    if json {
        println!(
            "{}",
            serde_json::to_string_pretty(&serde_json::json!({
                "results": results, "count": args.count,
                "heads": heads, "tails": tails,
            }))?
        );
    } else if args.count == 1 {
        println!("{}", results[0]);
    } else {
        for (i, r) in results.iter().enumerate() {
            println!("{:2}. {}", i + 1, r);
        }
        println!(
            "\nHeads: {} ({}%), Tails: {} ({}%)",
            heads,
            heads * 100 / args.count,
            tails,
            tails * 100 / args.count
        );
    }
    Ok(())
}
