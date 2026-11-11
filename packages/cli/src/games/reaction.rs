//! Reaction-time game: press Enter when the cue appears.
use anyhow::Result;
use rand::Rng;
use std::io::{self, Write};
use std::time::{Duration, Instant};

const ROUNDS: usize = 5;

pub fn run() -> Result<()> {
    println!("\n  REACTION TIME");
    println!("  Press Enter when you see the cue.");
    println!("  {ROUNDS} rounds. Best, worst, and average will be shown.\n");
    println!("  Press Enter to start...");
    let _ = io::stdin().read_line(&mut String::new());

    let mut times: Vec<u128> = Vec::with_capacity(ROUNDS);
    let mut rng = rand::rng();

    for _ in 0..ROUNDS {
        print!("  Get ready...");
        let _ = io::stdout().flush();
        let delay = Duration::from_millis(1000 + rng.random_range(0..4000));
        std::thread::sleep(delay);
        print!("\r  \x1b[32mNOW!\x1b[0m                 \n");
        let _ = io::stdout().flush();

        let start = Instant::now();
        let mut input = String::new();
        let _ = io::stdin().read_line(&mut input);
        times.push(start.elapsed().as_millis());
        println!("  \x1b[90m{}ms\x1b[0m\n", times.last().unwrap());
    }

    let best = *times.iter().min().unwrap();
    let worst = *times.iter().max().unwrap();
    let avg: u128 = times.iter().sum::<u128>() / times.len() as u128;
    println!("  Results:");
    println!("    Best:    {best}ms");
    println!("    Worst:   {worst}ms");
    println!("    Average: {avg}ms");
    println!();
    Ok(())
}
