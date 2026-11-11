mod better;
mod browser;
mod calc;
mod casino;
mod chess;
mod cli;
mod colors;
mod completion;
mod convert;
mod crypto;
mod data;
mod docsify;
mod doi;
mod english;
mod file;
mod games;
mod gemini;
mod gh;
mod history;
mod history_cmd;
mod image;
mod mcp;
mod net;
mod openapi;
mod openrouter;
mod pdf;
mod port;
mod requests;
mod search;
mod semver;
mod system;
mod telegram;
mod time;
mod timefmt;
mod tui;
mod version;
mod video;
mod web;
mod write;

use std::time::Instant;

fn command_path(matches: &clap::ArgMatches) -> String {
    let mut parts = vec!["omni".to_string()];
    let mut current = matches;
    while let Some((name, sub)) = current.subcommand() {
        parts.push(name.to_string());
        current = sub;
    }
    parts.join(" ")
}

fn should_track(path: &str) -> bool {
    if path.is_empty() || path == "omni" {
        return false;
    }
    for prefix in ["omni help", "omni completion", "omni history", "omni mcp"] {
        if path == prefix || path.starts_with(&format!("{prefix} ")) {
            return false;
        }
    }
    true
}

fn main() {
    let start = Instant::now();
    let matches = match cli::command().try_get_matches() {
        Ok(m) => m,
        Err(e) => e.exit(),
    };
    let path = command_path(&matches);
    let cwd = std::env::current_dir()
        .map(|d| d.display().to_string())
        .unwrap_or_default();
    let result = cli::dispatch(&matches);
    if should_track(&path) {
        let mcp_mode = std::env::var("OMNI_MCP_SOURCE").as_deref() == Ok("mcp");
        let mut entry = history::Entry {
            timestamp: chrono::Utc::now().to_rfc3339(),
            source: if mcp_mode { "mcp" } else { "cli" }.into(),
            command: if mcp_mode {
                path.strip_prefix("omni ").unwrap_or(&path).to_string()
            } else {
                path
            },
            cwd,
            duration_ms: start.elapsed().as_millis() as i64,
            error: String::new(),
        };
        if let Err(ref e) = result {
            entry.error = format!("{e:#}");
        }
        let _ = history::append(entry);
    }
    match result {
        Ok(()) => {}
        Err(e) => {
            eprintln!("Error: {e:#}");
            std::process::exit(1);
        }
    }
}
