//! Shared terminal-UI helpers (ratatui + crossterm), mirroring the Bubble Tea
//! programs in packages/cli.go.
pub mod chat;
pub mod theme;

use anyhow::Result;
use crossterm::event;
use crossterm::event::{
    DisableMouseCapture, EnableMouseCapture, Event, KeyCode, KeyEvent, KeyEventKind, KeyModifiers,
    MouseEvent,
};
use crossterm::execute;
use crossterm::terminal::{
    disable_raw_mode, enable_raw_mode, EnterAlternateScreen, LeaveAlternateScreen,
};
use ratatui::backend::CrosstermBackend;

use ratatui::Frame;
use ratatui::Terminal;
use std::io;
use std::time::Duration;

#[derive(Clone, Copy)]
pub enum AppEvent {
    Key(KeyEvent),
    Mouse(MouseEvent),
    Tick,
}

/// Canonical key names matching Bubble Tea's `msg.String()` values.
pub fn key_name(ev: &KeyEvent) -> Option<String> {
    if ev.kind == KeyEventKind::Release {
        return None;
    }
    let ctrl = ev.modifiers.contains(KeyModifiers::CONTROL);
    let name = match ev.code {
        KeyCode::Enter => "enter".to_string(),
        KeyCode::Up => "up".to_string(),
        KeyCode::Down => "down".to_string(),
        KeyCode::Left => "left".to_string(),
        KeyCode::Right => "right".to_string(),
        KeyCode::Esc => "esc".to_string(),
        KeyCode::Backspace => "backspace".to_string(),
        KeyCode::Delete => "delete".to_string(),
        KeyCode::Home => "home".to_string(),
        KeyCode::End => "end".to_string(),
        KeyCode::Char('c') if ctrl => "ctrl+c".to_string(),
        KeyCode::Char('x') if ctrl => "ctrl+x".to_string(),
        KeyCode::Char('d') if ctrl => "ctrl+d".to_string(),
        KeyCode::Char(c) if !ctrl && !ev.modifiers.contains(KeyModifiers::ALT) => c.to_string(),
        _ => return None,
    };
    Some(name)
}

pub fn char_key(ev: &KeyEvent) -> Option<char> {
    if ev.kind == KeyEventKind::Release {
        return None;
    }
    match ev.code {
        KeyCode::Char(c)
            if !ev.modifiers.contains(KeyModifiers::CONTROL)
                && !ev.modifiers.contains(KeyModifiers::ALT) =>
        {
            Some(c)
        }
        _ => None,
    }
}

pub trait TuiApp {
    /// Render one frame. Return `true` from `handle` to quit.
    fn draw(&mut self, frame: &mut Frame);
    /// Handle an event; return `true` to quit the application.
    fn handle(&mut self, ev: AppEvent) -> bool;
    /// How often `AppEvent::Tick` fires; `None` disables ticking.
    fn tick_interval(&self) -> Option<Duration> {
        None
    }
}

pub fn run<A: TuiApp>(mut app: A) -> Result<()> {
    enable_raw_mode()?;
    let mut stdout = io::stdout();
    execute!(stdout, EnterAlternateScreen, EnableMouseCapture)?;
    let backend = CrosstermBackend::new(stdout);
    let mut terminal = Terminal::new(backend)?;
    let result = event_loop(&mut terminal, &mut app);
    disable_raw_mode()?;
    execute!(
        terminal.backend_mut(),
        DisableMouseCapture,
        LeaveAlternateScreen
    )?;
    terminal.show_cursor()?;
    result
}

fn event_loop<A: TuiApp>(
    terminal: &mut Terminal<CrosstermBackend<io::Stdout>>,
    app: &mut A,
) -> Result<()> {
    loop {
        terminal.draw(|f| app.draw(f))?;
        let tick = app.tick_interval();
        let timeout = tick.unwrap_or_else(|| Duration::from_millis(200));
        if event::poll(timeout)? {
            let ev = match event::read()? {
                Event::Key(k) => Some(AppEvent::Key(k)),
                Event::Mouse(m) => Some(AppEvent::Mouse(m)),
                _ => None,
            };
            if let Some(ev) = ev {
                if app.handle(ev) {
                    break;
                }
            }
        } else if tick.is_some() && app.handle(AppEvent::Tick) {
            break;
        }
    }
    Ok(())
}
