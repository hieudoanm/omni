//! Interactive Texas Hold'em TUI (port of the Go Bubble Tea program).
use super::super::internal::{cards_display, new_shuffled_deck, Card};
use super::hand::{self, Rank};
use crate::tui::theme;
use crate::tui::{key_name, AppEvent, TuiApp};
use anyhow::Result;
use clap::Args;
use ratatui::layout::{Alignment, Rect};
use ratatui::text::{Line, Span};
use ratatui::widgets::Paragraph;
use ratatui::Frame;
use std::cmp::Ordering;

#[derive(Args)]
pub struct PlayArgs {}

const START_CHIPS: i32 = 1000;
const SMALL_BLIND: i32 = 10;
const BIG_BLIND: i32 = 20;

#[derive(Clone, Copy, PartialEq, PartialOrd)]
enum Street {
    Preflop,
    Flop,
    Turn,
    River,
    Showdown,
}

impl Street {
    fn name(self) -> &'static str {
        match self {
            Street::Preflop => "Preflop",
            Street::Flop => "Flop",
            Street::Turn => "Turn",
            Street::River => "River",
            Street::Showdown => "Showdown",
        }
    }
}

struct App {
    deck: Vec<Card>,
    hero: Vec<Card>,
    villain: Vec<Card>,
    board: Vec<Card>,
    pot: i32,
    hero_chips: i32,
    villain_chips: i32,
    street: Street,
    last_action: String,
    hero_bet: i32,
    villain_bet: i32,
    message: String,
    result: String,
    blinds_posted: bool,
    ai_final_hand: String,
    hero_final_hand: String,
}

fn deal_cards(d: &mut Vec<Card>, n: usize) -> Vec<Card> {
    (0..n)
        .map(|_| super::super::internal::deal_card(d))
        .collect()
}

fn ai_preflop_strength(hc: &[Card]) -> i32 {
    let r1 = hc[0].rank;
    let r2 = hc[1].rank;
    if r1 == r2 {
        if r1 >= 8 {
            return 8;
        }
        return 4;
    }
    let suited = hc[0].suit == hc[1].suit;
    if r1 + r2 >= 22 {
        if suited {
            return 7;
        }
        return 6;
    }
    if r1 + r2 >= 18 {
        if suited {
            return 5;
        }
        return 4;
    }
    if r1 + r2 >= 14 {
        if suited {
            return 3;
        }
        return 2;
    }
    1
}

fn ai_eval_strength(hc: &[Card], bc: &[Card]) -> i32 {
    if bc.is_empty() {
        return ai_preflop_strength(hc);
    }
    let mut all = hc.to_vec();
    all.extend_from_slice(bc);
    hand::best_hand(&all).rank as i32
}

impl App {
    fn advance_street(&mut self) {
        match self.street {
            Street::Preflop => {
                self.street = Street::Flop;
                let cards = deal_cards(&mut self.deck, 3);
                self.board.extend(cards);
            }
            Street::Flop => {
                self.street = Street::Turn;
                let cards = deal_cards(&mut self.deck, 1);
                self.board.extend(cards);
            }
            Street::Turn => {
                self.street = Street::River;
                let cards = deal_cards(&mut self.deck, 1);
                self.board.extend(cards);
            }
            Street::River => {
                self.street = Street::Showdown;
            }
            Street::Showdown => {}
        }
        self.hero_bet = 0;
        self.villain_bet = 0;
    }

    fn showdown(&mut self) {
        let mut hero_all = self.hero.clone();
        hero_all.extend_from_slice(&self.board);
        let mut villain_all = self.villain.clone();
        villain_all.extend_from_slice(&self.board);

        let hero_result = hand::best_hand(&hero_all);
        let villain_result = hand::best_hand(&villain_all);

        self.hero_final_hand = hero_result.rank.name().to_string();
        self.ai_final_hand = villain_result.rank.name().to_string();

        match hand::compare(&hero_result, &villain_result) {
            Ordering::Greater => {
                self.hero_chips += self.pot;
                self.result = "You win!".to_string();
            }
            Ordering::Equal => {
                self.hero_chips += self.pot / 2;
                self.villain_chips += self.pot / 2;
                if self.pot % 2 == 1 {
                    self.villain_chips += 1;
                }
                self.result = "Split pot.".to_string();
            }
            Ordering::Less => {
                self.villain_chips += self.pot;
                self.result = "Villain wins.".to_string();
            }
        }
        self.street = Street::Showdown;
    }

    fn ai_act(&self) -> (&'static str, i32) {
        if self.hero_bet == self.villain_bet {
            if self.street == Street::Preflop {
                if ai_preflop_strength(&self.villain) >= 5 {
                    let r = (self.pot / 2).max(10);
                    return ("raise", r);
                }
                return ("check", 0);
            }
            let str_ = ai_eval_strength(&self.villain, &self.board);
            if str_ >= Rank::OnePair as i32 {
                let r = (self.pot / 2).max(10);
                return ("raise", r);
            }
            return ("check", 0);
        }
        self.ai_respond_to_raise()
    }

    fn ai_respond_to_raise(&self) -> (&'static str, i32) {
        let diff = self.hero_bet - self.villain_bet;
        if self.street == Street::Preflop {
            let s = ai_preflop_strength(&self.villain);
            if s >= 5 {
                let r_amt = (self.pot / 2).max(10).min(self.villain_chips);
                return ("raise", r_amt);
            }
            if s >= 3 {
                return ("call", diff.min(self.villain_chips));
            }
            return ("fold", 0);
        }

        let str_ = ai_eval_strength(&self.villain, &self.board);
        if str_ >= Rank::TwoPair as i32 {
            let r_amt = (self.pot / 2).min(self.villain_chips);
            return ("raise", r_amt);
        }
        if str_ >= Rank::OnePair as i32 {
            return ("call", diff.min(self.villain_chips));
        }
        if self.pot > 0 && (diff as f64) / ((self.pot + diff) as f64) < 0.25 {
            return ("call", diff.min(self.villain_chips));
        }
        ("fold", 0)
    }

    fn hero_wins_pot(&mut self) {
        self.hero_chips += self.pot;
        self.result = "You win!".to_string();
        self.street = Street::Showdown;
        self.pot = 0;
    }

    fn villain_wins_pot(&mut self) {
        self.villain_chips += self.pot;
        self.result = "Villain wins.".to_string();
        self.street = Street::Showdown;
        self.pot = 0;
    }

    fn post_blinds(&mut self) {
        self.deck = new_shuffled_deck();
        self.hero = deal_cards(&mut self.deck, 2);
        self.villain = deal_cards(&mut self.deck, 2);
        self.board.clear();
        self.pot = 30;
        self.hero_chips -= SMALL_BLIND;
        self.villain_chips -= BIG_BLIND;
        self.hero_bet = SMALL_BLIND;
        self.villain_bet = BIG_BLIND;
        self.blinds_posted = true;
        self.street = Street::Preflop;
        self.last_action = "Blinds posted (SB $10, BB $20)".to_string();

        let str_ = ai_preflop_strength(&self.villain);
        if str_ < 3 {
            self.hero_chips += self.pot;
            self.pot = 0;
            self.hero_bet = 0;
            self.villain_bet = 0;
            self.blinds_posted = false;
            self.message = "Villain folded preflop. You win $30.".to_string();
            self.last_action = "Villain folded".to_string();
            return;
        }
        if str_ >= 6 {
            let raise = 30;
            self.villain_bet += raise;
            self.villain_chips -= raise;
            self.pot += raise;
            self.message = format!("Villain raises to ${}", self.villain_bet);
            self.last_action = "Villain raised".to_string();
            return;
        }
        self.message = "Your turn.".to_string();
        self.last_action = "Villain checked".to_string();
    }

    fn ai_acts_same_street(&mut self) {
        let (act, amt) = self.ai_act();
        match act {
            "check" => {
                self.last_action = "Villain checked".to_string();
                self.advance_street();
                if self.street == Street::Showdown {
                    self.showdown();
                }
            }
            "raise" => {
                let amt = amt.min(self.villain_chips);
                self.villain_bet += amt;
                self.villain_chips -= amt;
                self.pot += amt;
                self.last_action = "Villain raised".to_string();
                self.message = format!("Villain raises to ${}", self.villain_bet);
            }
            _ => {
                self.hero_wins_pot();
                self.result = "Villain folded. You win!".to_string();
            }
        }
    }

    /// Shared villain response after hero bets/raises.
    fn villain_responds(&mut self) {
        let (v_act, v_amt) = self.ai_respond_to_raise();
        match v_act {
            "fold" => self.hero_wins_pot(),
            "call" => {
                let v_amt = v_amt.min(self.villain_chips);
                self.villain_chips -= v_amt;
                self.pot += v_amt;
                self.villain_bet = self.hero_bet;
                self.last_action = "Villain called".to_string();
                self.advance_street();
                if self.street == Street::Showdown {
                    self.showdown();
                }
            }
            _ => {
                let v_amt = v_amt.min(self.villain_chips);
                self.villain_bet += v_amt;
                self.villain_chips -= v_amt;
                self.pot += v_amt;
                self.last_action = "Villain re-raised".to_string();
                self.message = format!("Villain re-raises to ${}", self.villain_bet);
            }
        }
    }
}

pub fn run(_args: &PlayArgs, _json: bool) -> Result<()> {
    let app = App {
        deck: Vec::new(),
        hero: Vec::new(),
        villain: Vec::new(),
        board: Vec::new(),
        pot: 0,
        hero_chips: START_CHIPS,
        villain_chips: START_CHIPS,
        street: Street::Preflop,
        last_action: String::new(),
        hero_bet: 0,
        villain_bet: 0,
        message: String::new(),
        result: String::new(),
        blinds_posted: false,
        ai_final_hand: String::new(),
        hero_final_hand: String::new(),
    };
    crate::tui::run(app)
}

impl TuiApp for App {
    fn draw(&mut self, frame: &mut Frame) {
        let area = frame.area();
        let title = Line::from(Span::styled(
            "♠ ♥ ♦ ♣  TEXAS HOLD'EM  ♠ ♥ ♦ ♣",
            theme::screen_title(),
        ));
        let gold = theme::gold();
        let info = theme::info();
        let mut lines = vec![
            title,
            Line::from(""),
            Line::from(vec![
                Span::raw("  You: "),
                Span::styled(format!("${}", self.hero_chips), gold),
                Span::raw("      Villain: "),
                Span::styled(format!("${}", self.villain_chips), gold),
                Span::raw("      Pot: "),
                Span::styled(format!("${}", self.pot), gold),
            ]),
            Line::from(""),
        ];

        if self.board.is_empty() {
            lines.push(Line::from("  Board: —"));
        } else {
            lines.push(Line::from(format!(
                "  Board: {}",
                cards_display(&self.board)
            )));
        }
        lines.push(Line::from(""));

        if self.street != Street::Showdown {
            lines.push(Line::from(format!(
                "  Your hand: {}",
                cards_display(&self.hero)
            )));
            if self.street == Street::Preflop && self.blinds_posted {
                lines.push(Line::from("  Villain: [??] [??]"));
            } else if self.street >= Street::Flop {
                lines.push(Line::from(format!(
                    "  Villain: {}",
                    cards_display(&self.villain)
                )));
            } else {
                lines.push(Line::from("  Villain: [??] [??]"));
            }
        } else {
            lines.push(Line::from(format!(
                "  Your hand: {} ({})",
                cards_display(&self.hero),
                self.hero_final_hand
            )));
            lines.push(Line::from(format!(
                "  Villain: {} ({})",
                cards_display(&self.villain),
                self.ai_final_hand
            )));
        }

        lines.push(Line::from(""));
        lines.push(Line::from(Span::styled(
            format!("  ■ {}", self.street.name()),
            theme::amber(),
        )));
        if !self.last_action.is_empty() {
            lines.push(Line::from(Span::styled(
                format!("  {}", self.last_action),
                info,
            )));
        }

        if self.street == Street::Showdown {
            let msg_style = if self.result.contains("win") {
                theme::success()
            } else if self.result.contains("fold") || self.result.contains("wins") {
                theme::error()
            } else {
                theme::message()
            };
            lines.push(Line::from(""));
            lines.push(Line::from(Span::styled(
                format!("  {}", self.result),
                msg_style,
            )));
            lines.push(Line::from(""));
            lines.push(Line::from(Span::styled(
                "  Enter to play again  •  q to quit",
                theme::dim(),
            )));
        } else {
            if !self.message.is_empty() {
                lines.push(Line::from(""));
                lines.push(Line::from(format!("  {}", self.message)));
                lines.push(Line::from(""));
            }
            if self.hero_bet < self.villain_bet {
                lines.push(Line::from(Span::styled(
                    "  [f] Fold  [c] Call  [r] Raise",
                    theme::info(),
                )));
            } else {
                lines.push(Line::from(Span::styled(
                    "  [f] Fold  [c] Check  [b] Bet",
                    theme::info(),
                )));
            }
            lines.push(Line::from(Span::styled("  [q] Quit", theme::dim())));
        }

        let p = Paragraph::new(lines).alignment(Alignment::Left);
        frame.render_widget(
            p,
            Rect::new(2, 1, area.width.saturating_sub(4), area.height),
        );
    }

    fn handle(&mut self, ev: AppEvent) -> bool {
        let AppEvent::Key(k) = ev else {
            return false;
        };
        let Some(name) = key_name(&k) else {
            return false;
        };
        if name == "q" || name == "ctrl+c" {
            return true;
        }

        if self.street == Street::Showdown {
            if name == "enter" {
                self.pot = 0;
                self.street = Street::Preflop;
                self.blinds_posted = false;
                self.hero_bet = 0;
                self.villain_bet = 0;
                self.last_action.clear();
                self.message.clear();
                self.result.clear();
                self.hero_final_hand.clear();
                self.ai_final_hand.clear();
                if self.hero_chips <= 0 || self.villain_chips <= 0 {
                    self.hero_chips = START_CHIPS;
                    self.villain_chips = START_CHIPS;
                    self.message = "New game!".to_string();
                }
            }
            return false;
        }

        if !self.blinds_posted {
            self.post_blinds();
            return false;
        }

        if self.hero_bet < self.villain_bet {
            match name.as_str() {
                "f" => self.villain_wins_pot(),
                "c" => {
                    let diff = self.villain_bet - self.hero_bet;
                    self.hero_chips -= diff;
                    self.pot += diff;
                    self.hero_bet = self.villain_bet;
                    self.last_action = "Hero called".to_string();
                    self.advance_street();
                    if self.street == Street::Showdown {
                        self.showdown();
                    }
                }
                "r" => {
                    let diff = self.villain_bet - self.hero_bet;
                    let mut raise_amt = self.pot;
                    if raise_amt > self.hero_chips - diff {
                        raise_amt = self.hero_chips - diff;
                    }
                    if raise_amt <= 0 {
                        self.message = "Not enough chips.".to_string();
                        return false;
                    }
                    self.hero_chips -= diff + raise_amt;
                    self.pot += diff + raise_amt;
                    self.hero_bet = self.villain_bet + raise_amt;
                    self.last_action = "Hero raised".to_string();
                    self.villain_responds();
                }
                _ => {}
            }
            return false;
        }

        match name.as_str() {
            "c" => {
                self.last_action = "Hero checked".to_string();
                self.ai_acts_same_street();
            }
            "b" => {
                let mut bet_amt = self.pot;
                if bet_amt > self.hero_chips {
                    bet_amt = self.hero_chips;
                }
                if bet_amt <= 0 {
                    self.message = "Not enough chips.".to_string();
                    return false;
                }
                self.hero_chips -= bet_amt;
                self.pot += bet_amt;
                self.hero_bet += bet_amt;
                self.last_action = "Hero bet".to_string();
                self.villain_responds();
            }
            "f" => self.villain_wins_pot(),
            _ => {}
        }
        false
    }
}
