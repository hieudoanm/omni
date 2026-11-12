//! Number-recall memory game.
use anyhow::Result;
use rand::RngExt;
use std::io::{self, Write};

const MAX_DIGITS: usize = 12;

fn ask(prompt: &str) -> Option<String> {
    print!("{prompt}");
    let _ = io::stdout().flush();
    let mut input = String::new();
    match io::stdin().read_line(&mut input) {
        Ok(0) | Err(_) => None,
        Ok(_) => Some(input.trim().to_string()),
    }
}

pub fn run() -> Result<()> {
    println!("\n  NUMBER RECALL");
    println!("  A number will flash on screen. Type it back from memory.");
    println!("  The length increases each round. Type 'quit' to stop.");
    println!("  Press Enter to start...");
    let _ = io::stdin().read_line(&mut String::new());

    let mut length = 3usize;
    let mut streak = 0usize;
    let mut rng = rand::rng();

    loop {
        let mut number = format!("{}", rng.random_range(1..=9));
        for _ in 1..length {
            number.push_str(&rng.random_range(0..=9).to_string());
        }
        print!("\r  {number}");
        let _ = io::stdout().flush();
        std::thread::sleep(std::time::Duration::from_millis(
            500 + (length * 250) as u64,
        ));
        print!("\r{}\r", " ".repeat(length + 2));
        let _ = io::stdout().flush();

        let Some(input) = ask("  >") else {
            return Ok(());
        };
        if input == "quit" {
            println!("\n  Longest streak: {streak}");
            println!("  Longest number: {length} digits\n");
            return Ok(());
        }
        if input == number {
            streak += 1;
            println!("  \x1b[32m✓ Correct! Streak: {streak}\x1b[0m\n");
            if length < MAX_DIGITS {
                length += 1;
            }
        } else {
            println!("  \x1b[31m✗ Nope! It was: {number}\x1b[0m\n");
            println!("  Starting over...");
            length = 3;
            streak = 0;
        }
    }
}
