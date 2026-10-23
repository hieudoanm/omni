//! Colour palette approximating the Go CLI's Lipgloss/ANSI-256 theme.

use ratatui::style::{Color, Modifier, Style};

fn ansi(v: u8) -> Color {
    Color::Indexed(v)
}

/// `theme.Title` — bold cyan, used for headers and the monitor title.
pub fn title() -> Style {
    Style::default().fg(ansi(51)).add_modifier(Modifier::BOLD)
}

/// Casino screen titles (Go used ANSI 212).
pub fn screen_title() -> Style {
    Style::default().fg(ansi(212)).add_modifier(Modifier::BOLD)
}

/// Bold amber values (balances, bets, highlights).
pub fn gold() -> Style {
    Style::default().fg(ansi(220)).add_modifier(Modifier::BOLD)
}

/// Win / success text and labels.
pub fn success() -> Style {
    Style::default().fg(ansi(42))
}

/// Loss / error text and labels.
pub fn error() -> Style {
    Style::default().fg(ansi(196))
}

/// `theme.Error` — soft red used by the system monitor.
pub fn error_soft() -> Style {
    Style::default().fg(Color::Rgb(0xe5, 0x73, 0x73))
}

/// Informational cyan (hints, keys, secondary values).
pub fn info() -> Style {
    Style::default().fg(ansi(51))
}

/// Warning / thinking amber.
pub fn warning() -> Style {
    Style::default().fg(ansi(220))
}

/// Tool-call labels (openrouter `amberClr`).
pub fn amber() -> Style {
    Style::default().fg(ansi(214))
}

/// Result / message body text.
pub fn message() -> Style {
    Style::default().fg(ansi(227))
}

/// Dim / muted text.
pub fn dim() -> Style {
    Style::default().fg(ansi(240))
}

/// Status line / footer text.
pub fn footer() -> Style {
    Style::default().fg(ansi(243))
}

/// `libs/chat` role labels.
pub fn label_user() -> Style {
    Style::default().fg(ansi(99)).add_modifier(Modifier::BOLD)
}

pub fn label_assistant() -> Style {
    Style::default().fg(ansi(42)).add_modifier(Modifier::BOLD)
}

pub fn label_error() -> Style {
    Style::default().fg(ansi(196)).add_modifier(Modifier::BOLD)
}

/// `libs/chat` message box: dark background, thick coloured left border.
pub fn chat_bg() -> Style {
    Style::default().bg(ansi(233))
}

/// Chat input box border (ANSI 39, matching the user-role accent).
pub fn input_border() -> Style {
    Style::default().fg(ansi(39))
}
