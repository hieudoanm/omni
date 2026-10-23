//! Chess.com API helpers.
use anyhow::{anyhow, Result};
use serde_json::Value;

pub const BASE: &str = "https://api.chess.com/pub";

pub fn get(url: &str) -> Result<Vec<u8>> {
    crate::requests::request("GET", url, None, &[]).map_err(|e| anyhow!("{e}"))
}

pub fn print_json(v: &Value) -> Result<()> {
    println!("{}", serde_json::to_string_pretty(v)?);
    Ok(())
}

pub fn s(v: &Value) -> String {
    v.as_str().unwrap_or("").to_string()
}

pub fn i(v: &Value) -> i64 {
    v.as_i64().unwrap_or(0)
}

pub fn country_from_url(url: &str) -> (String, String) {
    if url.is_empty() {
        return ("-".into(), "-".into());
    }
    let trimmed = url.trim_end_matches('/');
    let code = trimmed.rsplit('/').next().unwrap_or("").to_uppercase();
    (code.clone(), code)
}
