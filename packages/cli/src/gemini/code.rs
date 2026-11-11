//! Gemini-powered AI coding assistant TUI (port of the Go Bubble Tea program).
use super::client::{self, Content, PartOwned};
use crate::tui::chat::{self, ChatInput, ChatLog, ChatView, Role};
use crate::tui::{key_name, AppEvent, TuiApp};
use anyhow::Result;
use clap::Args;
use ratatui::text::Line;
use std::sync::mpsc::{channel, Receiver};
use std::time::{Duration, Instant};

#[derive(Args)]
pub struct CodeArgs {
    /// Output in JSON format
    #[arg(long, short = 'j', global = true, default_value_t = false)]
    pub json: bool,
}

const COMMANDS: &[(&str, &str)] = &[
    ("/help", "Show help"),
    ("/new", "Clear conversation"),
    ("/undo", "Remove last exchange"),
    ("/exit", "Quit"),
];

type ApiResult = Result<(String, i64), String>;

struct App {
    log: ChatLog,
    input: ChatInput,
    messages: Vec<Content>,
    model: String,
    loading: bool,
    rx: Option<Receiver<ApiResult>>,
    token_count: i64,
    waiting_prefix: bool,
    thought_start: Instant,
    spinner_start: Instant,
}

pub fn run(_args: &CodeArgs) -> Result<()> {
    let mut app = App {
        log: ChatLog::new(),
        input: ChatInput::new(),
        messages: Vec::new(),
        model: "gemini-2.5-flash".to_string(),
        loading: false,
        rx: None,
        token_count: 0,
        waiting_prefix: false,
        thought_start: Instant::now(),
        spinner_start: Instant::now(),
    };
    app.log.push(
        Role::Assistant,
        format!(
            "Gemini — {} ({})\n\nType a message, or /help for commands. Type /exit to quit.",
            client::model_name(&app.model),
            app.model
        ),
    );
    crate::tui::run(app)
}

impl App {
    fn record_thought(&mut self) {
        let secs = self.thought_start.elapsed().as_secs_f64();
        self.log.push(Role::Thought, chat::thought_line(secs));
    }

    fn send(&mut self, text: String) {
        self.log.push(Role::User, text.clone());
        self.messages.push(Content {
            role: "user".into(),
            parts: vec![PartOwned { text }],
        });
        self.input.reset();
        self.loading = true;
        self.spinner_start = Instant::now();
        self.thought_start = Instant::now();
        let model = self.model.clone();
        let messages = self.messages.clone();
        let (tx, rx) = channel();
        std::thread::spawn(move || {
            let _ = tx.send(client::generate(&model, &messages).map_err(|e| e.to_string()));
        });
        self.rx = Some(rx);
    }

    fn handle_slash(&mut self, cmd: &str) -> bool {
        let parts: Vec<&str> = cmd.split_whitespace().collect();
        match parts[0] {
            "/help" => self.log.push(
                Role::Assistant,
                "Slash commands:\n- /help     — Show help\n- /new      — Clear conversation\n- /undo     — Remove last exchange\n- /models   — List available models\n- /model N  — Switch to model by number\n- /exit     — Quit",
            ),
            "/new" => {
                self.messages.clear();
                self.log.clear();
            }
            "/undo" => {
                if self.messages.len() >= 2 {
                    self.messages.truncate(self.messages.len() - 2);
                }
                if self.log.len() >= 1 {
                    self.log.truncate(self.log.len() - 1);
                }
            }
            "/models" => {
                let mut buf = String::from("Available text generation models:\n\n");
                for (i, m) in client::MODELS.iter().enumerate() {
                    let mark = if m.id == self.model { "→" } else { " " };
                    buf.push_str(&format!("  {mark} {:2}. {:<30} {}\n", i + 1, m.name, m.id));
                }
                buf.push_str("\nType /model N to switch (e.g., /model 3)");
                self.log.push(Role::Assistant, buf);
            }
            "/model" => {
                if parts.len() < 2 {
                    self.log.push(
                        Role::Error,
                        "Usage: /model N (run /models to see available models)",
                    );
                } else {
                    match parts[1].parse::<usize>() {
                        Ok(n) if n >= 1 && n <= client::MODELS.len() => {
                            let new = client::MODELS[n - 1].id;
                            if new == self.model {
                                self.log.push(
                                    Role::Assistant,
                                    format!("Already using `{new}`"),
                                );
                            } else {
                                self.model = new.to_string();
                                self.log
                                    .push(Role::Assistant, format!("Switched to `{new}`"));
                            }
                        }
                        _ => self.log.push(
                            Role::Error,
                            "Usage: /model N (run /models to see available models)",
                        ),
                    }
                }
            }
            "/exit" => return true,
            other => self.log.push(
                Role::Error,
                format!("Unknown command: {other}\nTry /help"),
            ),
        }
        false
    }
}

impl TuiApp for App {
    fn draw(&mut self, frame: &mut ratatui::Frame) {
        let area = frame.area();
        let mut view = ChatView {
            log: &mut self.log,
            input: &self.input,
            loading: self.loading,
            spinner_frame: chat::spinner_frame(self.spinner_start.elapsed()),
            token_count: self.token_count,
            model_label: format!(
                "Gemini — {} ({})",
                client::model_name(&self.model),
                self.model
            ),
            commands: COMMANDS,
            extra_lines: Vec::<Line>::new(),
            width: area.width,
        };
        chat::draw_chat(frame, &mut view);
    }

    fn handle(&mut self, ev: AppEvent) -> bool {
        match ev {
            AppEvent::Mouse(m) => {
                chat::handle_mouse(&mut self.log, &m);
            }
            AppEvent::Tick => {
                if let Some(rx) = &self.rx {
                    if let Ok(res) = rx.try_recv() {
                        self.rx = None;
                        self.loading = false;
                        self.record_thought();
                        match res {
                            Ok((reply, tokens)) => {
                                self.token_count = tokens;
                                self.messages.push(Content {
                                    role: "model".into(),
                                    parts: vec![PartOwned {
                                        text: reply.clone(),
                                    }],
                                });
                                self.log.push(Role::Assistant, reply);
                            }
                            Err(e) => {
                                self.log.push(Role::Error, e);
                            }
                        }
                    }
                }
            }
            AppEvent::Key(k) => {
                if let Some(name) = key_name(&k) {
                    if self.waiting_prefix {
                        self.waiting_prefix = false;
                        match name.as_str() {
                            "q" => return true,
                            "?" => {
                                self.log.push(
                                    Role::Assistant,
                                    "Available commands:\n\n- /help  — Show help\n- /new   — Clear conversation\n- /undo  — Remove last exchange\n- /exit  — Quit\n\nKeys: enter to send, ctrl+x ? for help, ctrl+x q / esc / ctrl+c to quit",
                                );
                            }
                            _ => {}
                        }
                        return false;
                    }
                    match name.as_str() {
                        "esc" | "ctrl+c" => return true,
                        "ctrl+x" => self.waiting_prefix = true,
                        _ => {
                            if self.loading {
                                return false;
                            }
                            if let Some(text) = self.input.handle_key(&k) {
                                if text.starts_with('/') {
                                    if self.handle_slash(&text) {
                                        return true;
                                    }
                                } else if !self.loading {
                                    self.send(text);
                                }
                            }
                        }
                    }
                }
            }
        }
        false
    }

    fn tick_interval(&self) -> Option<Duration> {
        Some(Duration::from_millis(80))
    }
}
