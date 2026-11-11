//! Interactive baccarat TUI (port of the Go Bubble Tea program).
use super::rules;
use crate::casino::internal::{cards_display, new_shuffled_deck, Card};
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
    Result,
}

#[derive(Clone, Copy, PartialEq)]
enum BetType {
    None,
    Player,
    Banker,
    Tie,
}

struct App {
    deck: Vec<Card>,
    player: Vec<Card>,
    banker: Vec<Card>,
    balance: i32,
    bet: i32,
    bet_type: BetType,
    state: State,
    result: String,
    p_value: i32,
    b_value: i32,
}

impl App {
    fn deal(&mut self) {
        self.player = vec![self.deck[0], self.deck[1]];
        self.banker = vec![self.deck[2], self.deck[3]];
        self.deck = self.deck[4..].to_vec();

        self.p_value = rules::hand_sum(&self.player);
        self.b_value = rules::hand_sum(&self.banker);

        if self.p_value >= 8 || self.b_value >= 8 {
            self.finish();
            return;
        }

        if rules::should_draw(&self.player) {
            self.player.push(self.deck[0]);
            self.deck = self.deck[1..].to_vec();
            self.p_value = rules::hand_sum(&self.player);
            let pc = self.player[2];
            let p_val = rules::card_value(pc);
            if rules::draw_for_third(&self.banker, p_val) {
                self.banker.push(self.deck[0]);
                self.deck = self.deck[1..].to_vec();
                self.b_value = rules::hand_sum(&self.banker);
            }
        } else if rules::should_draw(&self.banker) {
            self.banker.push(self.deck[0]);
            self.deck = self.deck[1..].to_vec();
            self.b_value = rules::hand_sum(&self.banker);
        }

        self.finish();
    }

    fn finish(&mut self) {
        let pv = rules::hand_sum(&self.player);
        let bv = rules::hand_sum(&self.banker);
        self.p_value = pv;
        self.b_value = bv;

        self.result = if pv > bv && self.bet_type == BetType::Player {
            self.balance += self.bet * 2;
            format!("Player wins! You win ${}", self.bet)
        } else if bv > pv && self.bet_type == BetType::Banker {
            let win = self.bet + self.bet * 95 / 100;
            self.balance += win;
            format!(
                "Banker wins! You win ${} (5% commission)",
                self.bet * 95 / 100
            )
        } else if pv == bv && self.bet_type == BetType::Tie {
            self.balance += self.bet * 9;
            format!("Tie! You win 8:1, ${}", self.bet * 8)
        } else if pv == bv {
            self.balance += self.bet;
            "Tie. Bet returned.".to_string()
        } else {
            format!("You lose ${}", self.bet)
        };
    }
}

pub fn run(_args: &PlayArgs, _json: bool) -> Result<()> {
    let app = App {
        deck: Vec::new(),
        player: Vec::new(),
        banker: Vec::new(),
        balance: START_BALANCE,
        bet: START_BET,
        bet_type: BetType::None,
        state: State::Bet,
        result: String::new(),
        p_value: 0,
        b_value: 0,
    };
    crate::tui::run(app)
}

impl TuiApp for App {
    fn draw(&mut self, frame: &mut Frame) {
        let area = frame.area();
        let title = Line::from(Span::styled(
            "🃏 Baccarat",
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
                let bt = match self.bet_type {
                    BetType::None => "—",
                    BetType::Player => "Player",
                    BetType::Banker => "Banker",
                    BetType::Tie => "Tie",
                };
                lines.push(Line::from(format!(
                    "Bet on: [Player] ◄ {bt} ► [Banker]   [T] Tie"
                )));
                lines.push(Line::from(""));
                lines.push(Line::from(Span::styled(
                    "← → select side  •  ↑ ↓ bet  •  T tie  •  Enter deal  •  q quit",
                    Style::default().fg(Color::DarkGray),
                )));
            }
            State::Result => {
                lines.push(Line::from(vec![
                    Span::raw("Balance: "),
                    Span::styled(format!("${}", self.balance), gold),
                    Span::raw("      Bet: "),
                    Span::styled(format!("${}", self.bet), gold),
                ]));
                lines.push(Line::from(""));
                lines.push(Line::from(format!(
                    "Player: {}  ({})",
                    cards_display(&self.player),
                    self.p_value
                )));
                lines.push(Line::from(format!(
                    "Banker: {}  ({})",
                    cards_display(&self.banker),
                    self.b_value
                )));
                lines.push(Line::from(""));
                let msg_style = if self.result.contains("win") && !self.result.contains("lose") {
                    Style::default().fg(Color::Green)
                } else if self.result.contains("lose") {
                    Style::default().fg(Color::Red)
                } else {
                    Style::default().fg(Color::White)
                };
                lines.push(Line::from(Span::styled(
                    format!("  {}", self.result),
                    msg_style,
                )));
                lines.push(Line::from(""));
                lines.push(Line::from(Span::styled(
                    "Enter to continue  •  q to quit",
                    Style::default().fg(Color::DarkGray),
                )));
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
                "up" => self.bet = (self.bet + BET_STEP).min(self.balance),
                "down" => {
                    if self.bet >= BET_STEP {
                        self.bet -= BET_STEP;
                    }
                }
                "left" => self.bet_type = BetType::Banker,
                "right" => self.bet_type = BetType::Player,
                "t" => self.bet_type = BetType::Tie,
                "enter"
                    if self.bet > 0
                        && self.bet <= self.balance
                        && self.bet_type != BetType::None =>
                {
                    self.balance -= self.bet;
                    self.deck = new_shuffled_deck();
                    self.deal();
                    self.state = State::Result;
                }
                _ => {}
            },
            State::Result => {
                if name == "enter" {
                    self.bet = START_BET;
                    self.result.clear();
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
