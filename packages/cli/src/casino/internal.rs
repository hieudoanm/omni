//! Shared casino card types and helpers.
use anyhow::{anyhow, Result};
use rand::seq::SliceRandom;
use std::fmt;

#[derive(Clone, Copy, PartialEq, Eq, Hash, PartialOrd, Ord, Debug)]
pub enum Suit {
    Clubs,
    Diamonds,
    Hearts,
    Spades,
}

#[derive(Clone, Copy, PartialEq, Eq, Hash, PartialOrd, Ord, Debug)]
pub struct Card {
    pub rank: i32, // 2..=14 (11=J, 12=Q, 13=K, 14=A)
    pub suit: Suit,
}

const RANK_CHARS: &[u8; 13] = b"23456789TJQKA";

impl Card {
    pub fn rank_char(&self) -> char {
        RANK_CHARS[(self.rank - 2) as usize] as char
    }
    pub fn suit_char(&self) -> char {
        match self.suit {
            Suit::Clubs => 'c',
            Suit::Diamonds => 'd',
            Suit::Hearts => 'h',
            Suit::Spades => 's',
        }
    }
}

impl fmt::Display for Card {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}{}", self.rank_char(), self.suit_char())
    }
}

pub fn parse_card(s: &str) -> Result<Card> {
    let b = s.as_bytes();
    if b.len() < 2 {
        return Err(anyhow!("invalid card: {s:?}"));
    }
    let rank = match b[0] {
        b'2'..=b'9' => (b[0] - b'0') as i32,
        b'T' | b't' => 10,
        b'J' | b'j' => 11,
        b'Q' | b'q' => 12,
        b'K' | b'k' => 13,
        b'A' | b'a' => 14,
        _ => return Err(anyhow!("invalid card rank: {s:?}")),
    };
    let suit = match b[1].to_ascii_lowercase() {
        b'c' => Suit::Clubs,
        b'd' => Suit::Diamonds,
        b'h' => Suit::Hearts,
        b's' => Suit::Spades,
        _ => return Err(anyhow!("invalid card suit: {s:?}")),
    };
    Ok(Card { rank, suit })
}

pub fn new_shuffled_deck() -> Vec<Card> {
    let mut d = Vec::with_capacity(52);
    for r in 2..=14 {
        for s in [Suit::Clubs, Suit::Diamonds, Suit::Hearts, Suit::Spades] {
            d.push(Card { rank: r, suit: s });
        }
    }
    d.shuffle(&mut rand::rng());
    d
}

pub fn deal_card(d: &mut Vec<Card>) -> Card {
    d.remove(0)
}

pub fn card_display(c: Card) -> String {
    let r = c.rank_char();
    let s = match c.suit {
        Suit::Clubs => "♣",
        Suit::Diamonds => "♦",
        Suit::Hearts => "♥",
        Suit::Spades => "♠",
    };
    format!("[{r}{s}]")
}

pub fn cards_display(cards: &[Card]) -> String {
    cards
        .iter()
        .map(|&c| card_display(c))
        .collect::<Vec<_>>()
        .join(" ")
}
