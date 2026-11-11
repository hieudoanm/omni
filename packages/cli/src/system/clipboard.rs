use anyhow::Result;
use clap::Args;
use rusqlite::Connection;
use serde_json::json;
use std::path::PathBuf;
use std::process::Command;
use std::thread::sleep;
use std::time::Duration;

#[derive(Args)]
pub struct ClipboardArgs {}

pub fn run(_args: &ClipboardArgs, json: bool) -> Result<()> {
    let db_path = dirs::home_dir()
        .unwrap_or_else(|| PathBuf::from("."))
        .join(".omni/omni.db");
    if let Some(parent) = db_path.parent() {
        std::fs::create_dir_all(parent)?;
    }
    let db = Connection::open(&db_path)?;
    db.execute(
        "CREATE TABLE IF NOT EXISTS clips (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            content TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )",
        [],
    )?;

    println!("Clipboard watcher started... (Ctrl+C to stop)");
    let mut last = String::new();
    loop {
        match read_clipboard() {
            Ok(text) if !text.is_empty() && text != last => {
                if let Err(e) = db.execute("INSERT INTO clips (content) VALUES (?)", [&text]) {
                    eprintln!("insert error: {e}");
                } else {
                    if json {
                        println!(
                            "{}",
                            serde_json::to_string_pretty(&json!({
                                "content": text,
                                "preview": preview(&text),
                            }))?
                        );
                    } else {
                        println!("Saved: {}", preview(&text));
                    }
                }
                last = text;
                sleep(Duration::from_millis(500));
            }
            _ => sleep(Duration::from_millis(500)),
        }
    }
}

fn preview(text: &str) -> String {
    if text.chars().count() > 40 {
        format!("{}...", text.chars().take(40).collect::<String>())
    } else {
        text.to_string()
    }
}

/// Read system clipboard via platform tools (pbpaste / wl-paste / xclip / xsel).
fn read_clipboard() -> Result<String, std::io::Error> {
    #[cfg(target_os = "macos")]
    {
        Command::new("pbpaste")
            .output()
            .map(|o| String::from_utf8_lossy(&o.stdout).into_owned())
    }
    #[cfg(target_os = "linux")]
    {
        for (prog, args) in [
            ("wl-paste", vec!["-n"]),
            ("xclip", vec!["-o", "-selection", "clipboard"]),
            ("xsel", vec!["-b", "-o"]),
        ] {
            if let Ok(o) = Command::new(prog).args(&args).output() {
                if o.status.success() {
                    return Ok(String::from_utf8_lossy(&o.stdout).into_owned());
                }
            }
        }
        Err(std::io::Error::new(
            std::io::ErrorKind::NotFound,
            "no clipboard tool",
        ))
    }
    #[cfg(not(any(target_os = "macos", target_os = "linux")))]
    {
        Err(std::io::Error::new(
            std::io::ErrorKind::Unsupported,
            "unsupported platform",
        ))
    }
}
