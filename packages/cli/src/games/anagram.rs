//! Unscramble-the-letters game (survey prompts -> stdin lines).
use crate::games::internal::WORDS;
use anyhow::Result;
use rand::seq::IndexedRandom;
use rand::seq::SliceRandom;
use std::io::{self, Write};

fn scramble(word: &str) -> String {
    let mut chars: Vec<char> = word.chars().collect();
    let mut rng = rand::rng();
    for _ in 0..10 {
        chars.shuffle(&mut rng);
        let s: String = chars.iter().collect();
        if s != word {
            return s;
        }
    }
    chars.iter().collect()
}

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
    println!("\n  ANAGRAM");
    println!("  Unscramble the letters. Type 'quit' to stop.\n");
    let mut rng = rand::rng();
    loop {
        let word = WORDS.choose(&mut rng).copied().unwrap_or("");
        let scrambled = scramble(word);
        let Some(input) = ask(&format!("  {scrambled}")) else {
            return Ok(());
        };
        let input = input.to_lowercase();
        if input == "quit" {
            println!();
            return Ok(());
        }
        if input == word {
            println!("  ✓ Correct!");
        } else {
            println!("  ✗ Nope! The word was: {word}\n");
        }
    }
}
