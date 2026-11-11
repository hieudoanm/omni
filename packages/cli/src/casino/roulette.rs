use anyhow::Result;
use clap::Args;
use rand::Rng;

const ROULETTE_NUMBERS: [i32; 37] = [
    0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20,
    14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26,
];

#[derive(Args)]
pub struct RouletteArgs {
    /// Number of spins
    #[arg(long, short = 'n', default_value_t = 1)]
    pub spins: usize,
}

#[derive(serde::Serialize)]
struct SpinResult {
    number: i32,
    color: &'static str,
    parity: &'static str,
    half: &'static str,
}

fn classify(n: i32) -> (&'static str, &'static str, &'static str) {
    let color = if n == 0 {
        "Green"
    } else if n % 2 == 0 {
        "Red"
    } else {
        "Black"
    };
    let parity = if n == 0 {
        "Neither"
    } else if n % 2 == 0 {
        "Even"
    } else {
        "Odd"
    };
    let half = if n > 18 { "19-36" } else { "1-18" };
    (color, parity, half)
}

pub fn run(args: &RouletteArgs, json: bool) -> Result<()> {
    let mut rng = rand::rng();
    let results: Vec<SpinResult> = (0..args.spins)
        .map(|_| {
            let n = ROULETTE_NUMBERS[rng.random_range(0..ROULETTE_NUMBERS.len())];
            let (color, parity, half) = classify(n);
            SpinResult {
                number: n,
                color,
                parity,
                half,
            }
        })
        .collect();
    if json {
        println!(
            "{}",
            serde_json::to_string_pretty(&serde_json::json!({
                "spins": args.spins, "results": results,
            }))?
        );
    } else {
        for (i, r) in results.iter().enumerate() {
            if args.spins == 1 {
                println!("🎰 {} ({}, {}, {})", r.number, r.color, r.parity, r.half);
            } else {
                println!(
                    "  {:2}. {} ({}, {}, {})",
                    i + 1,
                    r.number,
                    r.color,
                    r.parity,
                    r.half
                );
            }
        }
    }
    Ok(())
}
