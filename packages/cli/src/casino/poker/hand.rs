//! 7-card poker hand evaluator (port of poker/hand/eval.go).
use crate::casino::internal::Card;
use std::cmp::Ordering;

#[derive(Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Debug)]
pub enum Rank {
    HighCard,
    OnePair,
    TwoPair,
    ThreeOfAKind,
    Straight,
    Flush,
    FullHouse,
    FourOfAKind,
    StraightFlush,
}

impl Rank {
    pub fn name(&self) -> &'static str {
        match self {
            Rank::HighCard => "High Card",
            Rank::OnePair => "One Pair",
            Rank::TwoPair => "Two Pair",
            Rank::ThreeOfAKind => "Three of a Kind",
            Rank::Straight => "Straight",
            Rank::Flush => "Flush",
            Rank::FullHouse => "Full House",
            Rank::FourOfAKind => "Four of a Kind",
            Rank::StraightFlush => "Straight Flush",
        }
    }
}

#[derive(Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Debug)]
pub struct Result_ {
    pub rank: Rank,
    pub score: i32,
}

pub use Result_ as EvalResult;

pub fn eval5(cards: &[Card; 5]) -> EvalResult {
    let mut counts = std::collections::BTreeMap::new();
    for c in cards {
        *counts.entry(c.rank).or_insert(0) += 1;
    }
    let mut pairs = Vec::new();
    let (mut trips, mut quads) = (0, 0);
    for (&r, &n) in &counts {
        match n {
            2 => pairs.push(r),
            3 => trips = r,
            4 => quads = r,
            _ => {}
        }
    }

    let flush = cards.iter().all(|c| c.suit == cards[0].suit);
    let (straight, high) = is_straight(cards);

    if flush && straight && high == 14 {
        return EvalResult {
            rank: Rank::StraightFlush,
            score: 14,
        };
    }
    if flush && straight {
        return EvalResult {
            rank: Rank::StraightFlush,
            score: high,
        };
    }
    if quads != 0 {
        return EvalResult {
            rank: Rank::FourOfAKind,
            score: quads,
        };
    }
    if trips != 0 && pairs.len() == 1 {
        return EvalResult {
            rank: Rank::FullHouse,
            score: trips * 100 + pairs[0],
        };
    }
    if flush {
        return EvalResult {
            rank: Rank::Flush,
            score: sum_high_cards(cards),
        };
    }
    if straight {
        return EvalResult {
            rank: Rank::Straight,
            score: high,
        };
    }
    if trips != 0 {
        return EvalResult {
            rank: Rank::ThreeOfAKind,
            score: trips,
        };
    }
    if pairs.len() == 2 {
        pairs.sort_by(|a, b| b.cmp(a));
        return EvalResult {
            rank: Rank::TwoPair,
            score: pairs[0] * 100 + pairs[1],
        };
    }
    if pairs.len() == 1 {
        return EvalResult {
            rank: Rank::OnePair,
            score: pairs[0],
        };
    }
    EvalResult {
        rank: Rank::HighCard,
        score: sum_high_cards(cards),
    }
}

fn is_straight(cards: &[Card; 5]) -> (bool, i32) {
    let mut ranks: Vec<i32> = cards.iter().map(|c| c.rank).collect();
    ranks.sort_unstable();
    let straight = ranks.windows(2).all(|w| w[1] == w[0] + 1);
    if straight {
        return (true, *ranks.last().unwrap());
    }
    if ranks == [2, 3, 4, 5, 14] {
        return (true, 5);
    }
    (false, 0)
}

fn sum_high_cards(cards: &[Card; 5]) -> i32 {
    let mut ranks: Vec<i32> = cards.iter().map(|c| c.rank).collect();
    ranks.sort_by(|a, b| b.cmp(a));
    ranks.iter().fold(0, |s, &r| s * 100 + r)
}

pub fn best_hand(cards: &[Card]) -> EvalResult {
    let n = cards.len();
    let mut best = EvalResult {
        rank: Rank::HighCard,
        score: 0,
    };
    let mut comb = [0usize, 1, 2, 3, 4];
    loop {
        let five: [Card; 5] = [
            cards[comb[0]],
            cards[comb[1]],
            cards[comb[2]],
            cards[comb[3]],
            cards[comb[4]],
        ];
        let r = eval5(&five);
        if r.rank > best.rank || (r.rank == best.rank && r.score > best.score) {
            best = r;
        }
        let mut i = 4i32;
        while i >= 0 && comb[i as usize] == i as usize + n - 5 {
            i -= 1;
        }
        if i < 0 {
            break;
        }
        comb[i as usize] += 1;
        for j in (i as usize + 1)..5 {
            comb[j] = comb[j - 1] + 1;
        }
    }
    best
}

/// Compare two eval results: Ordering::Greater means `a` beats `b`.
pub fn compare(a: &EvalResult, b: &EvalResult) -> Ordering {
    a.rank.cmp(&b.rank).then(a.score.cmp(&b.score))
}
