//! OpenRouter-powered AI coding assistant TUI (port of the Go Bubble Tea
//! program: tool calls with approval, slash commands, model picker, probe).
use super::config;
use super::lib::{self, Model, ProbeResult, ProbeStatus};
use crate::tui::chat::{self, ChatInput, ChatLog, ChatView, Role};
use crate::tui::{key_name, AppEvent, TuiApp};
use anyhow::Result;
use clap::Args;
use ratatui::text::Line;
use serde_json::{json, Value};
use std::path::Path;
use std::process::{Command, Stdio};
use std::sync::atomic::{AtomicUsize, Ordering};
use std::sync::mpsc::{channel, Receiver};
use std::sync::Arc;
use std::time::{Duration, Instant};

#[derive(Args)]
pub struct CodeArgs {
    /// Model ID (default: auto-select tool-capable model)
    #[arg(long, default_value = "")]
    pub model: String,
}

const DEFAULT_MODEL: &str = "google/gemma-4-26b-a4b-it:free";
const SYSTEM_PROMPT: &str = "You are a coding assistant integrated into the omni CLI toolbox.\n\nYou have access to tools that let you read, write, and edit files, and run bash commands.\n\nRules:\n- Always read a file before editing it.\n- Use exact string matching for edit_file.\n- When the user asks you to make changes, first read the relevant files, then make the edits.\n- After making edits, verify the result (e.g. build/test the project).\n- Be concise in your responses.";
const BASH_TIMEOUT: Duration = Duration::from_secs(30);

fn tool_definitions() -> Value {
    json!([
        {"type":"function","function":{"name":"read_file","description":"Read the contents of a file at the given path","parameters":{"type":"object","properties":{"path":{"type":"string","description":"Absolute path to the file"}},"required":["path"]}}},
        {"type":"function","function":{"name":"write_file","description":"Write content to a file (creates or overwrites)","parameters":{"type":"object","properties":{"path":{"type":"string","description":"Absolute path to the file"},"content":{"type":"string","description":"Full content to write"}},"required":["path","content"]}}},
        {"type":"function","function":{"name":"edit_file","description":"Replace exact text in a file (for surgical edits)","parameters":{"type":"object","properties":{"path":{"type":"string","description":"Absolute path to the file"},"old_string":{"type":"string","description":"The exact text to replace"},"new_string":{"type":"string","description":"The replacement text"}},"required":["path","old_string","new_string"]}}},
        {"type":"function","function":{"name":"run_bash","description":"Execute a bash command and return its output","parameters":{"type":"object","properties":{"command":{"type":"string","description":"The bash command to run"},"workdir":{"type":"string","description":"Working directory (default: current dir)"}},"required":["command"]}}}
    ])
}

fn init_messages() -> Vec<Value> {
    vec![json!({"role":"system","content":SYSTEM_PROMPT})]
}

fn resolve_path(path: &str) -> String {
    let p = Path::new(path);
    if p.is_absolute() {
        path.to_string()
    } else {
        std::env::current_dir()
            .map(|d| d.join(path).to_string_lossy().to_string())
            .unwrap_or_else(|_| path.to_string())
    }
}

fn tool_read_file(path: &str) -> String {
    match std::fs::read_to_string(resolve_path(path)) {
        Ok(d) => d,
        Err(e) => format!("Error: {e}"),
    }
}

fn tool_write_file(path: &str, content: &str) -> String {
    let path = resolve_path(path);
    if let Some(dir) = Path::new(&path).parent() {
        if let Err(e) = std::fs::create_dir_all(dir) {
            return format!("Error creating directory: {e}");
        }
    }
    match std::fs::write(&path, content) {
        Ok(()) => format!("Written {} bytes to {}", content.len(), path),
        Err(e) => format!("Error: {e}"),
    }
}

fn tool_edit_file(path: &str, old: &str, new: &str) -> String {
    let path = resolve_path(path);
    let Ok(content) = std::fs::read_to_string(&path) else {
        return format!("Error: cannot read {}", path);
    };
    if !content.contains(old) {
        return format!("Error: string not found in {}", path);
    }
    let updated = content.replacen(old, new, 1);
    match std::fs::write(&path, updated) {
        Ok(()) => format!("Edited {} (replaced one occurrence)", path),
        Err(e) => format!("Error: {e}"),
    }
}

fn tool_run_bash(command: &str, workdir: &str) -> String {
    let mut cmd = Command::new("bash");
    cmd.arg("-c")
        .arg(command)
        .stdin(Stdio::null())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped());
    if !workdir.is_empty() {
        cmd.current_dir(workdir);
    }
    let mut child = match cmd.spawn() {
        Ok(c) => c,
        Err(e) => return format!("Error: {e}"),
    };
    let deadline = Instant::now() + BASH_TIMEOUT;
    loop {
        match child.try_wait() {
            Ok(Some(_)) => break,
            Ok(None) => {
                if Instant::now() >= deadline {
                    let _ = child.kill();
                    let _ = child.wait();
                    return format!("Error: command timed out after {:?}", BASH_TIMEOUT);
                }
                std::thread::sleep(Duration::from_millis(50));
            }
            Err(e) => return format!("Error: {e}"),
        }
    }
    let Ok(out) = child.wait_with_output() else {
        return "Error: failed to read command output".to_string();
    };
    let mut text = String::from_utf8_lossy(&out.stdout).to_string();
    text.push_str(&String::from_utf8_lossy(&out.stderr));
    if text.is_empty() {
        return "Command completed (no output)".to_string();
    }
    if text.len() > 5000 {
        text.truncate(5000);
        text.push_str("\n...[truncated]");
    }
    text
}

fn run_tool(name: &str, args: &Value) -> String {
    let s = |k: &str| args.get(k).and_then(|v| v.as_str()).unwrap_or("");
    match name {
        "read_file" => tool_read_file(s("path")),
        "write_file" => tool_write_file(s("path"), s("content")),
        "edit_file" => tool_edit_file(s("path"), s("old_string"), s("new_string")),
        "run_bash" => tool_run_bash(s("command"), s("workdir")),
        _ => format!("Error: unknown tool {name}"),
    }
}

fn chat(model: &str, messages: &[Value]) -> Result<Value> {
    let api_key = config::load_api_key();
    if api_key.is_empty() {
        anyhow::bail!("OpenRouter API key not set");
    }
    let body = json!({
        "model": model,
        "messages": messages,
        "tools": tool_definitions(),
    });
    let (status, resp) = crate::requests::request_status(
        "POST",
        &format!("{}/chat/completions", lib::BASE_URL),
        Some(serde_json::to_vec(&body)?.as_slice()),
        &[
            ("Content-Type".into(), "application/json".into()),
            ("Authorization".into(), format!("Bearer {api_key}")),
            (
                "HTTP-Referer".into(),
                "https://github.com/hieudoanm/omni/packages/cli.go".into(),
            ),
            ("X-Title".into(), "omni".into()),
        ],
    )
    .map_err(|e| anyhow::anyhow!("API request: {e}"))?;
    let v: Value =
        serde_json::from_slice(&resp).map_err(|e| anyhow::anyhow!("parse response: {e}"))?;
    if let Some(err) = v.get("error") {
        return Err(anyhow::anyhow!("API error: {}", err));
    }
    if status != 200 {
        anyhow::bail!("API returned HTTP {status}");
    }
    Ok(v)
}

/// Go's pickToolModel: probe tool-capable candidates, pick the first OK.
fn pick_tool_model() -> String {
    if config::load_api_key().is_empty() {
        return DEFAULT_MODEL.to_string();
    }
    let models = match lib::fetch_free_models() {
        Ok(m) if !m.is_empty() => m,
        _ => return DEFAULT_MODEL.to_string(),
    };
    let mut candidates: Vec<Model> = Vec::new();
    for pat in ["gemma-4", "llama-3.2", "mistral"] {
        for m in &models {
            if m.id.to_lowercase().contains(pat) {
                candidates.push(m.clone());
            }
        }
    }
    if candidates.is_empty() {
        candidates = models.iter().take(10).cloned().collect();
    }
    let api_key = config::load_api_key();
    for r in probe_models(&candidates, &api_key) {
        if r.status == ProbeStatus::Ok {
            return r.model.id;
        }
    }
    models
        .first()
        .map(|m| m.id.clone())
        .unwrap_or_else(|| DEFAULT_MODEL.to_string())
}

/// Concurrent probe (Go used 6 workers); results sorted like Go.
fn probe_models(models: &[Model], api_key: &str) -> Vec<ProbeResult> {
    let results = Arc::new(
        (0..models.len())
            .map(|_| std::sync::Mutex::new(None))
            .collect::<Vec<_>>(),
    );
    let idx = Arc::new(AtomicUsize::new(0));
    let models: Vec<Model> = models.to_vec();
    let api_key = api_key.to_string();
    let mut handles = Vec::new();
    for _ in 0..6.min(models.len().max(1)) {
        let idx = idx.clone();
        let results = results.clone();
        let api_key = api_key.clone();
        let models = models.clone();
        handles.push(std::thread::spawn(move || loop {
            let i = idx.fetch_add(1, Ordering::SeqCst);
            if i >= models.len() {
                break;
            }
            let r = lib::probe_model(&models[i], &api_key);
            *results[i].lock().unwrap() = Some(r);
        }));
    }
    for h in handles {
        let _ = h.join();
    }
    let mut out: Vec<ProbeResult> = Vec::with_capacity(models.len());
    for cell in results.iter() {
        if let Some(r) = cell.lock().unwrap().take() {
            out.push(r);
        }
    }
    out.sort_by(|a, b| {
        (a.status as i32).cmp(&(b.status as i32)).then_with(|| {
            if a.status == ProbeStatus::Ok {
                a.latency_ms.cmp(&b.latency_ms)
            } else {
                a.model.id.cmp(&b.model.id)
            }
        })
    });
    out
}

#[derive(Clone, Copy, PartialEq)]
enum AppState {
    Normal,
    ToolConfirm,
    ModelPicker,
}

enum AsyncMsg {
    Chat(Result<Value, String>),
    Probe(Vec<ProbeResult>),
}

struct App {
    log: ChatLog,
    input: ChatInput,
    messages: Vec<Value>,
    app_state: AppState,
    pending_tool_calls: Vec<Value>,
    pending_text: String,
    model_choice: String,
    models: Vec<Model>,
    loading: bool,
    rx: Option<Receiver<AsyncMsg>>,
    waiting_prefix: bool,
    spinner_start: Instant,
}

pub fn run(args: &CodeArgs) -> Result<()> {
    let model = if args.model.is_empty() {
        pick_tool_model()
    } else {
        args.model.clone()
    };
    let mut app = App {
        log: ChatLog::new(),
        input: ChatInput::new(),
        messages: init_messages(),
        app_state: AppState::Normal,
        pending_tool_calls: Vec::new(),
        pending_text: String::new(),
        model_choice: model.clone(),
        models: Vec::new(),
        loading: false,
        rx: None,
        waiting_prefix: false,
        spinner_start: Instant::now(),
    };
    app.log.push(
        Role::Assistant,
        format!("opencode — {model}\n\nType a message, or /help for commands. Type /exit to quit."),
    );
    crate::tui::run(app)
}

impl App {
    fn send_to_api(&mut self) {
        self.loading = true;
        self.spinner_start = Instant::now();
        let model = self.model_choice.clone();
        let messages = self.messages.clone();
        let (tx, rx) = channel();
        std::thread::spawn(move || {
            let _ = tx.send(AsyncMsg::Chat(
                chat(&model, &messages).map_err(|e| e.to_string()),
            ));
        });
        self.rx = Some(rx);
    }

    fn append_user_message(&mut self, text: &str) {
        self.messages.push(json!({"role":"user","content":text}));
        self.log.push(Role::User, text);
    }

    fn handle_tool_confirm_key(&mut self, name: &str) -> bool {
        match name {
            "y" | "Y" => {
                let mut results = Vec::new();
                for tc in self.pending_tool_calls.clone() {
                    let fname = tc
                        .pointer("/function/name")
                        .and_then(|v| v.as_str())
                        .unwrap_or("");
                    let args: Value = tc
                        .pointer("/function/arguments")
                        .and_then(|v| v.as_str())
                        .and_then(|s| serde_json::from_str(s).ok())
                        .unwrap_or(json!({}));
                    let output = run_tool(fname, &args);
                    results.push(json!({
                        "role": "tool",
                        "content": output,
                        "tool_call_id": tc.get("id").cloned().unwrap_or(Value::Null),
                    }));
                }
                self.messages.extend(results);
                self.finish_tool_round();
            }
            "n" | "N" => {
                for tc in self.pending_tool_calls.clone() {
                    self.messages.push(json!({
                        "role": "tool",
                        "content": "User declined to run this tool call",
                        "tool_call_id": tc.get("id").cloned().unwrap_or(Value::Null),
                    }));
                }
                self.finish_tool_round();
            }
            "esc" | "ctrl+c" => return true,
            _ => {}
        }
        false
    }

    fn finish_tool_round(&mut self) {
        if !self.pending_text.is_empty() {
            let t = std::mem::take(&mut self.pending_text);
            self.log.push(Role::Assistant, t);
        }
        self.pending_tool_calls.clear();
        self.app_state = AppState::Normal;
        self.send_to_api();
    }

    fn switch_model(&mut self, idx: usize) {
        if idx == 0 || idx > self.models.len() {
            self.log.push(
                Role::Error,
                "Invalid model number. Run /models to see available models.",
            );
            self.app_state = AppState::Normal;
            return;
        }
        let new_model = self.models[idx - 1].id.clone();
        if new_model == self.model_choice {
            self.log
                .push(Role::Assistant, format!("Already using `{new_model}`"));
        } else {
            self.model_choice = new_model.clone();
            self.log
                .push(Role::Assistant, format!("Switched to `{new_model}`"));
        }
        self.app_state = AppState::Normal;
    }

    fn handle_slash(&mut self, cmd: &str) -> bool {
        let parts: Vec<&str> = cmd.split_whitespace().collect();
        match parts[0] {
            "/help" => self.log.push(
                Role::Assistant,
                "Slash commands:\n- /help     - Show help\n- /models   - List available models\n- /model N  - Switch to model by number\n- /probe    - Probe models for availability\n- /new      - Clear conversation\n- /undo     - Remove last exchange\n- /exit     - Quit",
            ),
            "/models" => match lib::fetch_free_models() {
                Ok(models) => {
                    self.models = models;
                    let mut buf = String::from("Available free models:\n\n");
                    for (i, m) in self.models.iter().enumerate() {
                        let mark = if m.id == self.model_choice { ">" } else { " " };
                        buf.push_str(&format!("  {mark} {:2}. {}\n", i + 1, m.id));
                    }
                    buf.push_str(&format!("\nTotal: {} models\n", self.models.len()));
                    buf.push_str("\nType /model N to switch, or /probe to check availability.");
                    self.log.push(Role::Assistant, buf);
                    self.app_state = AppState::ModelPicker;
                }
                Err(e) => self
                    .log
                    .push(Role::Error, format!("Failed to fetch models: {e}")),
            },
            "/probe" => {
                let api_key = config::load_api_key();
                if api_key.is_empty() {
                    self.log.push(Role::Error, "API key not set");
                } else {
                    match lib::fetch_free_models() {
                        Ok(models) => {
                            self.log.push(
                                Role::Assistant,
                                "Probing models for availability... (this may take a moment)",
                            );
                            let (tx, rx) = channel();
                            std::thread::spawn(move || {
                                let _ = tx.send(AsyncMsg::Probe(probe_models(&models, &api_key)));
                            });
                            self.rx = Some(rx);
                        }
                        Err(e) => self
                            .log
                            .push(Role::Error, format!("Failed to fetch models: {e}")),
                    }
                }
            }
            "/model" => {
                if parts.len() < 2 {
                    self.log.push(
                        Role::Error,
                        "Usage: /model N  (run /models first to see available models)",
                    );
                } else {
                    match parts[1].parse::<usize>() {
                        Ok(n) if n >= 1 && n <= self.models.len() => self.switch_model(n),
                        _ => self.log.push(
                            Role::Error,
                            "Usage: /model N  (N is a number)\nRun /models to see available models",
                        ),
                    }
                }
            }
            "/new" => {
                self.messages = init_messages();
                self.log.clear();
            }
            "/undo" => {
                if self.messages.len() >= 4 {
                    self.messages.truncate(self.messages.len() - 2);
                }
                if self.log.len() >= 1 {
                    self.log.truncate(self.log.len() - 1);
                }
            }
            "/exit" => return true,
            other => self
                .log
                .push(Role::Error, format!("Unknown command: {other}\nTry /help")),
        }
        false
    }

    fn handle_chat_result(&mut self, res: Result<Value, String>) {
        self.loading = false;
        match res {
            Err(e) => {
                self.log.push(Role::Error, e);
            }
            Ok(resp) => {
                let Some(choice0) = resp.pointer("/choices/0").cloned() else {
                    self.log.push(Role::Error, "no choices returned");
                    return;
                };
                let finish_reason = choice0
                    .get("finish_reason")
                    .and_then(|f| f.as_str())
                    .unwrap_or("");
                let Some(choice) = choice0.get("message").cloned() else {
                    self.log.push(Role::Error, "no choices returned");
                    return;
                };
                self.messages.push(choice.clone());

                let text = choice.get("content").and_then(|c| c.as_str()).unwrap_or("");
                if !text.is_empty() {
                    self.pending_text = text.to_string();
                }

                let tool_calls: Vec<Value> = choice
                    .get("tool_calls")
                    .and_then(|t| t.as_array())
                    .cloned()
                    .unwrap_or_default();
                if finish_reason == "tool_calls" || !tool_calls.is_empty() {
                    self.pending_tool_calls = tool_calls;
                    self.app_state = AppState::ToolConfirm;
                    return;
                }

                if !self.pending_text.is_empty() {
                    let t = std::mem::take(&mut self.pending_text);
                    self.log.push(Role::Assistant, t);
                }
            }
        }
    }

    fn probe_report(results: &[ProbeResult]) -> String {
        let mut ok = 0;
        let mut rl = 0;
        let mut restricted = 0;
        let mut errs = 0;
        for r in results {
            match r.status {
                ProbeStatus::Ok => ok += 1,
                ProbeStatus::RateLimited => rl += 1,
                ProbeStatus::Restricted => restricted += 1,
                ProbeStatus::Error => errs += 1,
            }
        }
        let mut buf = String::from("Probe results:\n");
        buf.push_str(&format!(
            "  {ok} OK  {rl} rate-limited  {restricted} restricted  {errs} errors\n\n"
        ));
        for r in results {
            let icon = match r.status {
                ProbeStatus::Ok => "OK",
                ProbeStatus::RateLimited => "RL",
                ProbeStatus::Restricted => "RE",
                ProbeStatus::Error => "ER",
            };
            let mut line = format!("  {icon} {}", r.model.id);
            if r.status == ProbeStatus::Ok {
                line.push_str(&format!("  {}ms", r.latency_ms));
            }
            buf.push_str(&line);
            buf.push_str("  \n");
            if r.status == ProbeStatus::Error && !r.message.is_empty() {
                let mut msg = r.message.clone();
                if msg.chars().count() > 60 {
                    msg = format!("{}...", msg.chars().take(57).collect::<String>());
                }
                buf.push_str(&format!("     {msg}  \n"));
            }
        }
        buf
    }

    fn tool_confirm_lines(&self) -> Vec<Line<'static>> {
        let mut lines = vec![Line::from(vec![ratatui::text::Span::styled(
            "TOOL",
            crate::tui::theme::amber().add_modifier(ratatui::style::Modifier::BOLD),
        )])];
        for (i, tc) in self.pending_tool_calls.iter().enumerate() {
            let fname = tc
                .pointer("/function/name")
                .and_then(|v| v.as_str())
                .unwrap_or("?");
            let args_str = tc
                .pointer("/function/arguments")
                .and_then(|v| v.as_str())
                .unwrap_or("{}");
            let args: Value = serde_json::from_str(args_str).unwrap_or(json!({}));
            let mut tool_line = format!("  {}. {fname}(", i + 1);
            let mut first = true;
            if let Some(map) = args.as_object() {
                for (k, v) in map {
                    if !first {
                        tool_line.push_str(", ");
                    }
                    tool_line.push_str(&format!(
                        "{k}={}",
                        serde_json::to_string(v).unwrap_or_default()
                    ));
                    first = false;
                }
            }
            tool_line.push(')');
            lines.push(Line::from(vec![ratatui::text::Span::styled(
                tool_line,
                crate::tui::theme::dim(),
            )]));
        }
        lines.push(Line::from(""));
        lines.push(Line::from(vec![ratatui::text::Span::styled(
            "Approve? (y/n)",
            crate::tui::theme::success().add_modifier(ratatui::style::Modifier::BOLD),
        )]));
        lines
    }
}

impl TuiApp for App {
    fn draw(&mut self, frame: &mut ratatui::Frame) {
        let area = frame.area();
        let extra = if self.app_state == AppState::ToolConfirm {
            self.tool_confirm_lines()
        } else {
            Vec::new()
        };
        let mut view = ChatView {
            log: &mut self.log,
            input: &self.input,
            loading: self.loading,
            spinner_frame: chat::spinner_frame(self.spinner_start.elapsed()),
            token_count: 0,
            model_label: format!("OpenRouter - {}", self.model_choice),
            commands: &[],
            extra_lines: extra,
            width: area.width,
        };
        chat::draw_chat(frame, &mut view);
    }

    fn handle(&mut self, ev: AppEvent) -> bool {
        match self.app_state {
            AppState::ToolConfirm => {
                if let AppEvent::Key(k) = ev {
                    if let Some(name) = key_name(&k) {
                        return self.handle_tool_confirm_key(&name);
                    }
                }
                return false;
            }
            AppState::ModelPicker => {
                if let AppEvent::Key(k) = ev {
                    if let Some(name) = key_name(&k) {
                        match name.as_str() {
                            "enter" => {
                                let text = self.input.text.trim().to_string();
                                self.input.reset();
                                if let Ok(n) = text.parse::<usize>() {
                                    self.switch_model(n);
                                } else {
                                    self.log.push(
                                        Role::Error,
                                        "Enter a number from the model list above.",
                                    );
                                }
                            }
                            "esc" => {
                                self.app_state = AppState::Normal;
                                self.input.reset();
                            }
                            _ => {
                                self.input.handle_key(&k);
                            }
                        }
                    }
                }
                return false;
            }
            AppState::Normal => {}
        }

        match ev {
            AppEvent::Mouse(m) => {
                chat::handle_mouse(&mut self.log, &m);
            }
            AppEvent::Tick => {
                if let Some(rx) = &self.rx {
                    match rx.try_recv() {
                        Ok(msg) => {
                            self.rx = None;
                            match msg {
                                AsyncMsg::Chat(res) => self.handle_chat_result(res),
                                AsyncMsg::Probe(results) => {
                                    self.log.push(Role::Assistant, Self::probe_report(&results));
                                }
                            }
                        }
                        Err(std::sync::mpsc::TryRecvError::Empty) => {}
                        Err(std::sync::mpsc::TryRecvError::Disconnected) => {
                            self.rx = None;
                            self.loading = false;
                        }
                    }
                }
            }
            AppEvent::Key(k) => {
                if self.loading {
                    if let Some(name) = key_name(&k) {
                        if name == "esc" || name == "ctrl+c" {
                            return true;
                        }
                    }
                    return false;
                }
                if let Some(name) = key_name(&k) {
                    if self.waiting_prefix {
                        self.waiting_prefix = false;
                        match name.as_str() {
                            "q" => return true,
                            "?" => {
                                self.log.push(
                                    Role::Assistant,
                                    "Available commands:\n\n- /help  — Show help\n- /models — List models\n- /probe — Probe availability\n- /new   — Clear conversation\n- /undo  — Remove last exchange\n- /exit  — Quit\n\nKeys: enter to send, ctrl+x ? for help, ctrl+x q / esc / ctrl+c to quit",
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
                            if let Some(text) = self.input.handle_key(&k) {
                                if text.starts_with('/') {
                                    if self.handle_slash(&text) {
                                        return true;
                                    }
                                } else {
                                    self.append_user_message(&text);
                                    self.input.reset();
                                    self.send_to_api();
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
