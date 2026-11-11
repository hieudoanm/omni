//! Terminal Wordle (survey prompts -> stdin lines).
use crate::games::internal::WORDS;
use anyhow::Result;
use rand::seq::IndexedRandom;
use serde::Serialize;
use std::io::{self, Write};

const GREEN: &str = "\x1b[32m";
const YELLOW: &str = "\x1b[33m";
const GRAY: &str = "\x1b[90m";
const RESET: &str = "\x1b[0m";
const BOLD: &str = "\x1b[1m";

#[derive(Clone, Copy, PartialEq)]
enum Status {
    Absent,
    Present,
    Correct,
}

struct LetterResult {
    letter: char,
    status: Status,
}

struct Guess {
    word: String,
    result: Vec<LetterResult>,
}

#[derive(Serialize)]
struct GameResult {
    word: String,
    won: bool,
    attempts: usize,
    guesses: Vec<GuessJSON>,
}

#[derive(Serialize)]
struct GuessJSON {
    word: String,
    result: Vec<&'static str>,
}

fn evaluate_guess(secret: &str, guess_word: &str) -> Vec<LetterResult> {
    let secret: Vec<char> = secret.chars().collect();
    let guess: Vec<char> = guess_word.chars().collect();
    let mut result: Vec<LetterResult> = guess
        .iter()
        .map(|&g| LetterResult {
            letter: g,
            status: Status::Absent,
        })
        .collect();
    let mut used = vec![false; secret.len()];

    for (i, &g) in guess.iter().enumerate() {
        if i < secret.len() && g == secret[i] {
            result[i] = LetterResult {
                letter: g,
                status: Status::Correct,
            };
            used[i] = true;
        }
    }
    for (i, &g) in guess.iter().enumerate() {
        if result[i].status == Status::Correct {
            continue;
        }
        for (j, &s) in secret.iter().enumerate() {
            if !used[j] && g == s {
                result[i] = LetterResult {
                    letter: g,
                    status: Status::Present,
                };
                used[j] = true;
                break;
            }
        }
    }
    result
}

fn format_result(g: &Guess) -> String {
    let mut out = String::new();
    for r in &g.result {
        match r.status {
            Status::Correct => out.push_str(&format!("{GREEN}{BOLD}")),
            Status::Present => out.push_str(&format!("{YELLOW}{BOLD}")),
            Status::Absent => out.push_str(GRAY),
        }
        out.push(r.letter);
        out.push_str(&format!("{RESET} "));
    }
    out
}

fn is_valid_word(word: &str) -> bool {
    // Go checked membership against the full WORDS list; Wordle's 5-letter
    // answers are a subset, but Go used the same list for both.
    WORDS.contains(&word)
}

fn status_to_string(s: Status) -> &'static str {
    match s {
        Status::Correct => "correct",
        Status::Present => "present",
        Status::Absent => "absent",
    }
}

fn ask(prompt: &str) -> Option<String> {
    print!("{prompt}");
    let _ = io::stdout().flush();
    let mut input = String::new();
    match io::stdin().read_line(&mut input) {
        Ok(0) | Err(_) => None,
        Ok(_) => Some(input.trim().to_lowercase()),
    }
}

fn build_result(secret: &str, won: bool, attempts: usize, guesses: &[Guess]) -> GameResult {
    GameResult {
        word: secret.to_string(),
        won,
        attempts,
        guesses: guesses
            .iter()
            .map(|g| GuessJSON {
                word: g.word.clone(),
                result: g
                    .result
                    .iter()
                    .map(|r| status_to_string(r.status))
                    .collect(),
            })
            .collect(),
    }
}

pub fn run(json_output: bool) -> Result<()> {
    let mut rng = rand::rng();
    let secret = WORDS.choose(&mut rng).copied().unwrap_or("").to_string();
    let mut guesses: Vec<Guess> = Vec::new();

    println!("\n{BOLD}  WORDLE{RESET}");
    println!("{GRAY}  Guess the 5-letter word. You have 6 tries.{RESET}\n");

    let mut turn = 1usize;
    while turn <= 6 {
        let Some(input) = ask(&format!("Guess {turn}/6:")) else {
            return Ok(());
        };
        if input.chars().count() != 5 {
            println!("{GRAY}  Word must be exactly 5 letters.{RESET}");
            continue;
        }
        if !is_valid_word(&input) {
            println!("{GRAY}  Not in word list.{RESET}");
            continue;
        }
        let result = evaluate_guess(&secret, &input);
        guesses.push(Guess {
            word: input.clone(),
            result,
        });
        println!("\n");
        for prev in &guesses {
            println!("  {}", format_result(prev));
        }
        println!();
        if input == secret {
            println!("{GREEN}{BOLD}  You got it in {turn} tries! 🎉{RESET}\n");
            if json_output {
                println!(
                    "{}",
                    serde_json::to_string_pretty(&build_result(&secret, true, turn, &guesses))?
                );
            }
            return Ok(());
        }
        turn += 1;
    }

    println!("{GRAY}  The word was: {RESET}{BOLD}{secret}{RESET}\n");
    if json_output {
        println!(
            "{}",
            serde_json::to_string_pretty(&build_result(&secret, false, 6, &guesses))?
        );
    }
    Ok(())
}
