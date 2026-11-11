//! Interactive blackjack TUI (port of the Go Bubble Tea program).
use super::super::internal::{deal_card, new_shuffled_deck, Card};
use crate::tui::{key_name, AppEvent, TuiApp};
use anyhow::Result;
use clap::Args;
use ratatui::layout::{Alignment, Rect};
use ratatui::style::{Color, Modifier, Style};
use ratatui::text::{Line, Span};
use ratatui::widgets::Paragraph;
use ratatui::Frame;

#[derive(Args)]
pub struct PlayArgs {}

const START_BALANCE: i32 = 1000;
const START_BET: i32 = 25;
const BET_STEP: i32 = 25;

#[derive(Clone, Copy, PartialEq)]
enum State {
    Bet,
    Player,
    Result,
}

struct App {
    deck: Vec<Card>,
    player: Vec<Card>,
    dealer: Vec<Card>,
    balance: i32,
    bet: i32,
    state: State,
    message: String,
}

fn bj_value(c: Card) -> i32 {
    if (11..=13).contains(&c.rank) {
        10
    } else if c.rank == 14 {
        11
    } else {
        c.rank
    }
}

fn hand_value(cards: &[Card]) -> i32 {
    let mut val = 0;
    let mut aces = 0;
    for c in cards {
        if c.rank == 14 {
            aces += 1;
        }
        val += bj_value(*c);
    }
    while aces > 0 && val > 21 {
        val -= 10;
        aces -= 1;
    }
    val
}

fn card_text(c: Card) -> String {
    let rank = match c.rank {
        14 => "A".to_string(),
        13 => "K".to_string(),
        12 => "Q".to_string(),
        11 => "J".to_string(),
        r => r.to_string(),
    };
    let suit = match c.suit {
        super::super::internal::Suit::Clubs => "♣",
        super::super::internal::Suit::Diamonds => "♦",
        super::super::internal::Suit::Hearts => "♥",
        super::super::internal::Suit::Spades => "♠",
    };
    format!("{rank}{suit}")
}

fn render_cards(cards: &[Card], hide_first: bool) -> String {
    cards
        .iter()
        .enumerate()
        .map(|(i, &c)| {
            if hide_first && i == 0 {
                "🂠".to_string()
            } else {
                card_text(c)
            }
        })
        .collect::<Vec<_>>()
        .join(" ")
}

fn run_dealer(app: &mut App) {
    while hand_value(&app.dealer) < 17 {
        let c = deal_card(&mut app.deck);
        app.dealer.push(c);
    }
}

fn settle_bet(app: &mut App) {
    let pv = hand_value(&app.player);
    let dv = hand_value(&app.dealer);
    if dv > 21 || pv > dv {
        app.balance += app.bet * 2;
        app.message = "You win!".to_string();
    } else if pv == dv {
        app.balance += app.bet;
        app.message = "Push.".to_string();
    } else {
        app.message = "Dealer wins.".to_string();
    }
}

pub fn run(_args: &PlayArgs, _json: bool) -> Result<()> {
    let app = App {
        deck: Vec::new(),
        player: Vec::new(),
        dealer: Vec::new(),
        balance: START_BALANCE,
        bet: START_BET,
        state: State::Bet,
        message: String::new(),
    };
    crate::tui::run(app)
}

impl TuiApp for App {
    fn draw(&mut self, frame: &mut Frame) {
        let area = frame.area();
        let title = Line::from(Span::styled(
            "🃏 Blackjack",
            Style::default()
                .fg(Color::White)
                .add_modifier(Modifier::BOLD),
        ));
        let gold = Style::default()
            .fg(Color::Yellow)
            .add_modifier(Modifier::BOLD);
        let mut lines = vec![title, Line::from("")];

        match self.state {
            State::Bet => {
                lines.push(Line::from(vec![
                    Span::raw("Balance: "),
                    Span::styled(format!("${}", self.balance), gold),
                ]));
                lines.push(Line::from(""));
                lines.push(Line::from(vec![
                    Span::raw("Bet: "),
                    Span::styled(format!("${}", self.bet), gold),
                ]));
                lines.push(Line::from(""));
                lines.push(Line::from(Span::styled(
                    "← → adjust bet  •  Enter to deal  •  q to quit",
                    Style::default().fg(Color::DarkGray),
                )));
            }
            State::Player | State::Result => {
                lines.push(Line::from(vec![
                    Span::raw("Balance: "),
                    Span::styled(format!("${}", self.balance), gold),
                    Span::raw("      Bet: "),
                    Span::styled(format!("${}", self.bet), gold),
                ]));
                lines.push(Line::from(""));
                let dealer_val = if self.state == State::Result {
                    hand_value(&self.dealer)
                } else {
                    hand_value(&self.dealer[1..])
                };
                lines.push(Line::from(format!(
                    "Dealer: {}  ({dealer_val})",
                    render_cards(&self.dealer, self.state != State::Result)
                )));
                lines.push(Line::from(format!(
                    "Player: {}  ({})",
                    render_cards(&self.player, false),
                    hand_value(&self.player)
                )));
                lines.push(Line::from(""));
                if self.state == State::Player {
                    lines.push(Line::from(Span::styled(
                        "[h] Hit  [s] Stand  [d] Double  [q] Quit",
                        Style::default().fg(Color::Cyan),
                    )));
                } else {
                    let msg_style = if self.message.contains("win") {
                        Style::default().fg(Color::Green)
                    } else if self.message.contains("Bust")
                        || self.message.contains("lose")
                        || self.message.contains("wins")
                    {
                        Style::default().fg(Color::Red)
                    } else {
                        Style::default().fg(Color::White)
                    };
                    lines.push(Line::from(Span::styled(
                        format!("  {}", self.message),
                        msg_style,
                    )));
                    lines.push(Line::from(""));
                    lines.push(Line::from(Span::styled(
                        "Enter to continue  •  q to quit",
                        Style::default().fg(Color::DarkGray),
                    )));
                }
            }
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
        match self.state {
            State::Bet => match name.as_str() {
                "up" | "right" => {
                    self.bet = (self.bet + BET_STEP).min(self.balance);
                }
                "down" | "left" => {
                    if self.bet >= BET_STEP {
                        self.bet -= BET_STEP;
                    }
                }
                "enter" if self.bet > 0 && self.bet <= self.balance => {
                    self.balance -= self.bet;
                    self.deck = new_shuffled_deck();
                    self.player = vec![deal_card(&mut self.deck), deal_card(&mut self.deck)];
                    self.dealer = vec![deal_card(&mut self.deck), deal_card(&mut self.deck)];
                    let pv = hand_value(&self.player);
                    let dv = hand_value(&self.dealer);
                    if pv == 21 && dv == 21 {
                        self.balance += self.bet;
                        self.message = "Push! Both have blackjack.".to_string();
                        self.state = State::Result;
                    } else if pv == 21 {
                        self.balance += (self.bet as f64 * 2.5) as i32;
                        self.message = "Blackjack! You win 3:2!".to_string();
                        self.state = State::Result;
                    } else if dv == 21 {
                        self.message = "Dealer has blackjack. You lose.".to_string();
                        self.state = State::Result;
                    } else {
                        self.state = State::Player;
                    }
                }
                _ => {}
            },
            State::Player => match name.as_str() {
                "h" => {
                    let c = deal_card(&mut self.deck);
                    self.player.push(c);
                    if hand_value(&self.player) > 21 {
                        self.message = "Bust! You lose.".to_string();
                        self.state = State::Result;
                    }
                }
                "s" => {
                    run_dealer(self);
                    settle_bet(self);
                    self.state = State::Result;
                }
                "d" if self.player.len() == 2 => {
                    self.balance -= self.bet;
                    self.bet *= 2;
                    let c = deal_card(&mut self.deck);
                    self.player.push(c);
                    if hand_value(&self.player) > 21 {
                        self.message = "Bust! You lose.".to_string();
                        self.state = State::Result;
                    } else {
                        run_dealer(self);
                        settle_bet(self);
                        self.state = State::Result;
                    }
                }
                _ => {}
            },
            State::Result => {
                if name == "enter" {
                    self.bet = START_BET;
                    self.message.clear();
                    self.state = State::Bet;
                    if self.balance <= 0 {
                        self.balance = START_BALANCE;
                    }
                }
            }
        }
        false
    }
}
