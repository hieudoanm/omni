use anyhow::Result;
use clap::Args;

#[derive(Args)]
pub struct CheatsheetArgs {}

#[derive(Clone, Copy, PartialEq)]
enum Act {
    H,
    S,
    D,
    P,
    #[allow(dead_code)]
    N,
}

impl Act {
    fn as_str(&self) -> &'static str {
        match self {
            Act::H => "H",
            Act::S => "S",
            Act::D => "D",
            Act::P => "P",
            Act::N => "N",
        }
    }
}

use Act::*;

const HARD_STR: [[Act; 10]; 17] = [
    [H, H, H, H, H, H, H, H, H, H],
    [H, H, H, H, H, H, H, H, H, H],
    [H, H, H, H, H, H, H, H, H, H],
    [H, H, H, H, H, H, H, H, H, H],
    [H, H, H, H, H, H, H, H, H, H],
    [H, H, H, H, H, H, H, H, H, H],
    [H, H, H, H, H, H, H, H, H, H],
    [H, D, D, D, D, H, H, H, H, H],
    [D, D, D, D, D, D, D, D, H, H],
    [H, H, S, S, S, H, H, H, H, H],
    [S, S, S, S, S, H, H, H, H, H],
    [S, S, S, S, S, H, H, H, H, H],
    [S, S, S, S, S, H, H, H, H, H],
    [S, S, S, S, S, S, S, S, S, S],
    [S, S, S, S, S, S, S, S, S, S],
    [S, S, S, S, S, S, S, S, S, S],
    [S, S, S, S, S, S, S, S, S, S],
];

const SOFT_STR: [[Act; 10]; 8] = [
    [H, H, D, D, D, H, H, H, H, H],
    [H, D, D, D, D, H, H, H, H, H],
    [H, D, D, D, D, H, H, H, H, H],
    [H, D, D, D, D, H, H, H, H, H],
    [H, D, D, D, D, H, H, H, H, H],
    [S, S, S, S, D, S, S, S, H, H],
    [S, S, S, S, S, S, S, S, S, S],
    [S, S, S, S, S, S, S, S, S, S],
];

const PAIR_STR: [[Act; 10]; 10] = [
    [P, P, P, P, P, P, H, H, H, H],
    [P, P, P, P, P, P, H, H, H, H],
    [H, H, H, P, P, H, H, H, H, H],
    [H, H, H, H, H, H, H, H, H, H],
    [P, P, P, P, P, H, H, H, H, H],
    [P, P, P, P, P, P, H, H, H, H],
    [P, P, P, P, P, S, P, P, S, S],
    [P, P, P, P, P, S, P, P, S, S],
    [S, S, S, S, S, S, S, S, S, S],
    [P, P, P, P, P, P, P, P, P, P],
];

fn dealer_label(i: usize) -> String {
    if i == 9 {
        " A".to_string()
    } else {
        format!("{:2}", i + 2)
    }
}

fn cheatsheet_header() -> String {
    let mut header = "    ".to_string();
    for i in 0..10 {
        header.push_str(&dealer_label(i));
        header.push(' ');
    }
    header
}

fn cheatsheet_row(label: &str, acts: &[Act; 10]) -> String {
    let mut row = format!("{label:<4}");
    for a in acts {
        row.push_str(&format!(" {} ", a.as_str()));
    }
    row
}

pub fn run(_args: &CheatsheetArgs, _json: bool) -> Result<()> {
    let header = cheatsheet_header();
    println!("{}", "=".repeat(47));
    println!("  BASIC BLACKJACK STRATEGY");
    println!("{}", "=".repeat(47));
    println!();
    println!("  H = Hit   S = Stand   D = Double   P = Split");
    println!();
    println!("  Dealer upcard:");
    println!("  {header}");
    println!("  {}", "─".repeat(33));
    println!("  HARD TOTALS");
    for total in 5..=21usize {
        let idx = total - 5;
        if idx < HARD_STR.len() {
            println!(
                "  {}",
                cheatsheet_row(&format!("{total:2}"), &HARD_STR[idx])
            );
        }
    }
    println!();
    println!("  SOFT TOTALS");
    for (i, a) in SOFT_STR.iter().enumerate() {
        println!("  {}", cheatsheet_row(&format!("A,{}", i + 2), a));
    }
    println!();
    println!("  PAIR SPLITTING");
    let pair_labels = [
        "2,2", "3,3", "4,4", "5,5", "6,6", "7,7", "8,8", "9,9", "10,10", "A,A",
    ];
    for (i, a) in PAIR_STR.iter().enumerate() {
        println!("  {}", cheatsheet_row(pair_labels[i], a));
    }
    println!();
    println!("{}", "─".repeat(47));
    println!("  D = Double if allowed, otherwise Hit");
    println!("  Based on 6+ decks, dealer hits soft 17 (H17)");
    println!("  Blackjack pays 3:2");
    println!("{}", "─".repeat(47));
    Ok(())
}
