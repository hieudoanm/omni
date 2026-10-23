//! Typing-speed game.
use anyhow::Result;
use rand::seq::IndexedRandom;
use std::io::{self, Write};
use std::time::Instant;

const PASSAGES: &[&str] = &[
    "The quick brown fox jumps over the lazy dog near the bank of the river.",
    "A journey of a thousand miles begins with a single step toward the horizon.",
    "In the middle of difficulty lies opportunity if you know where to look.",
    "Success is not final, failure is not fatal. It is the courage to continue that counts.",
    "The only limit to our realization of tomorrow will be our doubts of today.",
    "Life is what happens when you are busy making other plans along the way.",
    "Do not watch the clock. Do what it does and keep going forward without pause.",
    "The best time to plant a tree was twenty years ago. The second best time is now.",
];

pub fn run() -> Result<()> {
    let mut rng = rand::rng();
    let passage = PASSAGES.choose(&mut rng).copied().unwrap_or("");

    println!("\n  TYPING RACE");
    println!("  Type the passage below and press Enter:");
    println!("  \x1b[90m{passage}\x1b[0m\n");

    print!("  >");
    let _ = io::stdout().flush();
    let start = Instant::now();
    let mut input = String::new();
    let _ = io::stdin().read_line(&mut input);
    let elapsed = start.elapsed();

    let input = input.trim_end_matches('\n');
    let elapsed_sec = elapsed.as_secs_f64();

    let target_words = passage.split_whitespace().count();
    let input_words = input.split_whitespace().count();
    let wpm = if elapsed_sec > 0.0 {
        input_words as f64 / elapsed_sec * 60.0
    } else {
        0.0
    };

    let correct = passage
        .chars()
        .zip(input.chars())
        .filter(|(a, b)| a == b)
        .count()
        .min(passage.chars().count());
    let total = passage.chars().count();
    let accuracy = if total > 0 {
        correct as f64 / total as f64 * 100.0
    } else {
        0.0
    };

    println!("\n  Time:     {elapsed_sec:.1}s");
    println!("  WPM:      {wpm:.0}");
    println!("  Accuracy: {accuracy:.0}% ({correct}/{total} chars)");
    println!("  Target:   {target_words} words");
    println!("  Typed:    {input_words} words");
    println!();
    Ok(())
}
