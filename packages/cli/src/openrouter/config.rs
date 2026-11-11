//! OpenRouter config: env var → ~/.omni/config.json → ~/.fr → .env → prompt.
use anyhow::Result;
use serde::Deserialize;
use std::io::BufRead;

#[derive(Debug, Default, Deserialize)]
pub struct Config {
    #[serde(default)]
    pub open_router_api_key: String,
    #[serde(default)]
    #[allow(dead_code)]
    pub weather_api_key: String,
    #[serde(default)]
    #[allow(dead_code)]
    pub telegram_bot_token: String,
    #[serde(default)]
    #[allow(dead_code)]
    pub github_token: String,
}

fn config_path() -> Result<std::path::PathBuf> {
    let home = dirs::home_dir().ok_or_else(|| anyhow::anyhow!("home dir"))?;
    Ok(home.join(".omni/config.json"))
}

pub fn load() -> Result<Config> {
    let path = config_path()?;
    let data = match std::fs::read(&path) {
        Ok(d) => d,
        Err(e) if e.kind() == std::io::ErrorKind::NotFound => return Ok(Config::default()),
        Err(e) => return Err(anyhow::anyhow!("read config: {e}")),
    };
    serde_json::from_slice(&data).map_err(|e| anyhow::anyhow!("parse config: {e}"))
}

pub fn open_router_key() -> String {
    if let Ok(v) = std::env::var("OPEN_ROUTER_API_KEY") {
        if !v.is_empty() {
            return v;
        }
    }
    load().map(|c| c.open_router_api_key).unwrap_or_default()
}

fn read_key_from_file(path: &str) -> String {
    let Ok(f) = std::fs::File::open(path) else {
        return String::new();
    };
    for line in std::io::BufReader::new(f).lines() {
        let line = line.unwrap_or_default();
        let line = line.trim();
        if line.is_empty() || line.starts_with('#') {
            continue;
        }
        if let Some(v) = line.strip_prefix("OPEN_ROUTER_API_KEY=") {
            return v.to_string();
        }
        if line.starts_with("sk-") {
            return line.to_string();
        }
    }
    String::new()
}

/// LoadAPIKey resolves the key: env → config → ~/.fr → .env → interactive prompt.
pub fn load_api_key() -> String {
    if let Ok(v) = std::env::var("OPEN_ROUTER_API_KEY") {
        if !v.is_empty() {
            return v;
        }
    }
    let key = open_router_key();
    if !key.is_empty() {
        return key;
    }
    let home = dirs::home_dir()
        .map(|h| h.display().to_string())
        .unwrap_or_default();
    let key = read_key_from_file(&format!("{home}/.fr"));
    if !key.is_empty() {
        return key;
    }
    let key = read_key_from_file(".env");
    if !key.is_empty() {
        return key;
    }
    println!("OPEN_ROUTER_API_KEY is not set.");
    print!("Please enter your OpenRouter API key: ");
    use std::io::Write;
    let _ = std::io::stdout().flush();
    let mut line = String::new();
    if std::io::stdin().read_line(&mut line).is_err() {
        eprintln!("failed to read API key");
        return String::new();
    }
    let key = line.trim().to_string();
    if !key.is_empty() {
        // best-effort: persist for this process only (Go used os.Setenv)
        unsafe { std::env::set_var("OPEN_ROUTER_API_KEY", &key) };
    }
    key
}
