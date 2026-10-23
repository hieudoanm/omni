//! Baccarat drawing rules (port of baccarat/rules/rules.go).
use crate::casino::internal::Card;

pub fn card_value(c: Card) -> i32 {
    if c.rank >= 10 {
        0
    } else {
        c.rank
    }
}

pub fn hand_sum(cards: &[Card]) -> i32 {
    cards.iter().map(|&c| card_value(c)).sum::<i32>() % 10
}

pub fn should_draw(cards: &[Card]) -> bool {
    hand_sum(cards) <= 5
}

pub fn draw_for_third(cards: &[Card], player_third: i32) -> bool {
    match hand_sum(cards) {
        v if v <= 2 => true,
        3 => player_third != 8,
        4 => (2..=7).contains(&player_third),
        5 => (4..=7).contains(&player_third),
        6 => player_third == 6 || player_third == 7,
        _ => false,
    }
}
