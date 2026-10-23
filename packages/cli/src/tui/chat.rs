//! Shared chat-TUI building blocks used by `gemini code` and `openrouter code`
//! (ports of libs/chat in packages/cli.go).
use crate::tui::theme;
use crate::tui::{char_key, key_name};
use crossterm::event::{KeyEvent, MouseButton, MouseEventKind};
use ratatui::layout::{Constraint, Direction, Layout};
use ratatui::style::Style;
use ratatui::text::{Line, Span, Text};
use ratatui::widgets::{Block, Borders, Paragraph, Scrollbar, ScrollbarState};
use ratatui::Frame;
use std::time::Duration;

#[derive(Clone, Copy, PartialEq)]
pub enum Role {
    User,
    Assistant,
    Error,
    Thought,
}

impl Role {
    pub fn label(self) -> &'static str {
        match self {
            Role::User => "You",
            Role::Assistant => "Omni",
            Role::Error => "Error",
            Role::Thought => "",
        }
    }

    fn style(self) -> Style {
        match self {
            Role::User => theme::label_user(),
            Role::Assistant => theme::label_assistant(),
            Role::Error => theme::label_error(),
            Role::Thought => theme::dim(),
        }
    }
}

pub struct Msg {
    pub role: Role,
    pub content: String,
}

const SPINNER: &[&str] = &["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⦦", "⠧", "⠇", "⠏"];

/// Scrollable message log with cached markdown rendering.
pub struct ChatLog {
    pub msgs: Vec<Msg>,
    rendered: Vec<Text<'static>>,
    rendered_width: u16,
    /// Lines scrolled up from the bottom (0 = latest).
    pub scroll: u16,
}

impl ChatLog {
    pub fn new() -> Self {
        ChatLog {
            msgs: Vec::new(),
            rendered: Vec::new(),
            rendered_width: 0,
            scroll: 0,
        }
    }

    pub fn push(&mut self, role: Role, content: impl Into<String>) {
        self.msgs.push(Msg {
            role,
            content: content.into(),
        });
        self.scroll = 0;
    }

    pub fn clear(&mut self) {
        self.msgs.clear();
        self.rendered.clear();
        self.scroll = 0;
    }

    /// Drop the last `n` display entries (for /undo).
    pub fn truncate(&mut self, len: usize) {
        self.msgs.truncate(len);
        self.rendered.clear();
        self.scroll = 0;
    }

    pub fn len(&self) -> usize {
        self.msgs.len()
    }

    fn ensure_rendered(&mut self, width: u16) {
        if self.rendered_width == width && self.rendered.len() == self.msgs.len() {
            return;
        }
        self.rendered_width = width;
        self.rendered = self
            .msgs
            .iter()
            .map(|m| render_message(m.role, &m.content, width as usize))
            .collect();
    }

    /// Flattened display lines (labels + content + spacing).
    pub fn lines(&mut self, width: u16, loading: bool, spinner: &str) -> Text<'static> {
        self.ensure_rendered(width);
        let mut out: Vec<Line<'static>> = Vec::new();
        for (i, t) in self.rendered.iter().enumerate() {
            let role = self.msgs[i].role;
            if role == Role::Thought {
                for line in t.lines.iter() {
                    out.push(line.clone().style(theme::dim()));
                }
            } else {
                let label = role.label();
                out.push(Line::from(vec![Span::styled(
                    format!("● {label}"),
                    role.style(),
                )]));
                out.extend(t.lines.iter().cloned());
            }
            out.push(Line::from(""));
        }
        if loading {
            out.push(Line::from(vec![Span::styled(
                format!("  {spinner} thinking..."),
                theme::warning(),
            )]));
        }
        Text::from(out)
    }
}

/// Single-line text input with a byte cursor (ports textarea behaviour for
/// the chat use-case: enter submits, so no multiline editing).
#[derive(Default)]
pub struct ChatInput {
    pub text: String,
    pub cursor: usize,
}

impl ChatInput {
    pub fn new() -> Self {
        ChatInput::default()
    }

    pub fn reset(&mut self) {
        self.text.clear();
        self.cursor = 0;
    }

    pub fn starts_with_slash(&self) -> bool {
        self.text.trim_start().starts_with('/')
    }

    fn char_left(&self, pos: usize) -> usize {
        self.text[..pos]
            .char_indices()
            .next_back()
            .map(|(i, _)| i)
            .unwrap_or(0)
    }

    fn char_right(&self, pos: usize) -> usize {
        self.text[pos..]
            .char_indices()
            .nth(1)
            .map(|(i, _)| pos + i)
            .unwrap_or(self.text.len())
    }

    /// Handle a key event; returns `Some(text)` when enter submits.
    pub fn handle_key(&mut self, ev: &KeyEvent) -> Option<String> {
        match key_name(ev)?.as_str() {
            "enter" => {
                let text = self.text.trim().to_string();
                self.reset();
                if text.is_empty() {
                    None
                } else {
                    Some(text)
                }
            }
            "backspace" => {
                if self.cursor > 0 {
                    let start = self.char_left(self.cursor);
                    self.text.replace_range(start..self.cursor, "");
                    self.cursor = start;
                }
                None
            }
            "delete" => {
                if self.cursor < self.text.len() {
                    let end = self.char_right(self.cursor);
                    self.text.replace_range(self.cursor..end, "");
                }
                None
            }
            "left" => {
                self.cursor = self.char_left(self.cursor);
                None
            }
            "right" => {
                self.cursor = self.char_right(self.cursor);
                None
            }
            "home" => {
                self.cursor = 0;
                None
            }
            "end" => {
                self.cursor = self.text.len();
                None
            }
            _ => {
                if let Some(c) = char_key(ev) {
                    self.text.insert(self.cursor, c);
                    self.cursor += c.len_utf8();
                }
                None
            }
        }
    }

    /// Render "> text▏" clipped to `width` chars around the cursor.
    pub fn view(&self, width: usize) -> String {
        let w = width.max(1);
        let chars: Vec<char> = self.text.chars().collect();
        let cur_char = self.text[..self.cursor.min(self.text.len())]
            .chars()
            .count();
        let total = chars.len();
        let mut start = cur_char.saturating_sub(w / 2);
        if total > w && start + w > total {
            start = total - w;
        }
        let end = (start + w).min(total);
        let slice: String = chars[start..end].iter().collect();
        let cursor_pos = cur_char.saturating_sub(start).min(slice.chars().count());
        let byte_pos = slice
            .char_indices()
            .nth(cursor_pos)
            .map(|(i, _)| i)
            .unwrap_or(slice.len());
        format!("{}▏{}", &slice[..byte_pos], &slice[byte_pos..])
    }
}

/// Everything needed to draw one chat frame.
pub struct ChatView<'a> {
    pub log: &'a mut ChatLog,
    pub input: &'a ChatInput,
    pub loading: bool,
    pub spinner_frame: usize,
    pub token_count: i64,
    pub model_label: String,
    pub commands: &'a [(&'static str, &'static str)],
    pub extra_lines: Vec<Line<'static>>,
    pub width: u16,
}

pub fn draw_chat(frame: &mut Frame, view: &mut ChatView) {
    let area = frame.area();
    let commands_h: u16 = if view.input.starts_with_slash() {
        (view.commands.len() as u16) + 1
    } else {
        0
    };
    let input_h = 3u16;
    let status_h = 1u16;
    let history_h = area
        .height
        .saturating_sub(commands_h + input_h + status_h + 2);

    let chunks = Layout::default()
        .direction(Direction::Vertical)
        .constraints([
            Constraint::Length(history_h),
            Constraint::Length(commands_h),
            Constraint::Length(input_h),
            Constraint::Length(status_h),
        ])
        .split(area);

    // History
    let spinner = SPINNER[view.spinner_frame % SPINNER.len()];
    let text = view.log.lines(view.width, view.loading, spinner);
    let content_h = text.height();
    let scroll = view
        .log
        .scroll
        .min((content_h as u16).saturating_sub(history_h));
    view.log.scroll = scroll;
    let p = Paragraph::new(text)
        .scroll((scroll, 0))
        .wrap(ratatui::widgets::Wrap { trim: false });
    frame.render_widget(p, chunks[0]);
    if (content_h as u16) > history_h {
        let mut state =
            ScrollbarState::new(content_h).position(content_h.saturating_sub(scroll as usize));
        frame.render_stateful_widget(
            Scrollbar::new(ratatui::widgets::ScrollbarOrientation::VerticalRight),
            chunks[0],
            &mut state,
        );
    }

    // Commands dropdown
    if commands_h > 0 {
        let mut lines = vec![Line::from("")];
        for (cmd, desc) in view.commands {
            lines.push(Line::from(vec![
                Span::styled(*cmd, theme::dim()),
                Span::raw(format!("  {desc}")),
            ]));
        }
        frame.render_widget(Paragraph::new(lines), chunks[1]);
    }

    // Input box (bordered, input line + model label)
    let input_block = Block::default()
        .borders(Borders::ALL)
        .border_style(theme::input_border());
    let inner = input_block.inner(chunks[2]);
    frame.render_widget(input_block, chunks[2]);
    if !view.extra_lines.is_empty() {
        // Tool-confirm / picker overlay inside the input area.
        let mut lines = view.extra_lines.clone();
        lines.push(Line::from(""));
        lines.push(Line::from(Span::styled(
            format!(
                "> {}",
                view.input.view(inner.width.saturating_sub(2) as usize)
            ),
            Style::default(),
        )));
        frame.render_widget(Paragraph::new(lines), chunks[2]);
    } else {
        let content = vec![
            Line::from(Span::styled(
                format!(
                    "> {}",
                    view.input.view(inner.width.saturating_sub(2) as usize)
                ),
                theme::chat_bg(),
            )),
            Line::from(Span::styled(view.model_label.clone(), theme::footer())),
        ];
        frame.render_widget(Paragraph::new(content), inner);
    }

    // Status line
    let status = format!(
        "● connected  ·  {} tokens  ·  {} messages  ·  ctrl+x q to exit  ·  ctrl+x ? for help",
        view.token_count,
        view.log.len()
    );
    frame.render_widget(
        Paragraph::new(Line::from(Span::styled(status, theme::footer()))),
        chunks[3],
    );
}

/// Scroll the history by `delta` lines (positive = up); clamped at draw time.
pub fn scroll_by(log: &mut ChatLog, delta: i32) {
    if delta >= 0 {
        log.scroll = log.scroll.saturating_add(delta as u16);
    } else {
        log.scroll = log.scroll.saturating_sub((-delta) as u16);
    }
}

/// Handle a mouse event over the chat area; returns true if it was a scroll.
pub fn handle_mouse(log: &mut ChatLog, ev: &crossterm::event::MouseEvent) -> bool {
    match ev.kind {
        MouseEventKind::ScrollUp => {
            scroll_by(log, 3);
            true
        }
        MouseEventKind::ScrollDown => {
            scroll_by(log, -3);
            true
        }
        MouseEventKind::Down(MouseButton::Left) => true,
        _ => false,
    }
}

/// Render one chat message's raw content to ratatui text (markdown via termimad,
/// ANSI -> ratatui spans via ansi-to-tui).
pub fn render_message(role: Role, content: &str, width: usize) -> Text<'static> {
    if role == Role::Thought {
        return Text::raw(content.to_string());
    }
    let rendered =
        termimad::FmtText::from(termimad::get_default_skin(), content, Some(width.max(20)))
            .to_string();
    match ansi_to_tui::IntoText::into_text(&rendered) {
        Ok(t) => t,
        Err(_) => Text::raw(content.to_string()),
    }
}

/// "+ Thought: Xs" record (ports RecordThought).
pub fn thought_line(seconds: f64) -> String {
    format!("+ Thought: {seconds:.1} s")
}

pub fn spinner_frame(elapsed: Duration) -> usize {
    (elapsed.as_millis() / 80) as usize
}
