//! Telegram Bot API helpers.
use anyhow::{anyhow, Result};
use serde_json::Value;

pub fn api_url(token: &str, method: &str) -> String {
    format!("https://api.telegram.org/bot{token}/{method}")
}

pub fn resolve_token(flag: &str) -> Result<String> {
    if !flag.is_empty() {
        return Ok(flag.to_string());
    }
    let token = std::env::var("TELEGRAM_BOT_TOKEN").unwrap_or_default();
    if token.is_empty() {
        anyhow::bail!(
            "telegram bot token required: use --token flag or set TELEGRAM_BOT_TOKEN env var"
        );
    }
    Ok(token)
}

fn print_result(body: &[u8], json: bool) -> Result<()> {
    let v: Value = serde_json::from_slice(body).map_err(|e| anyhow!("{e}"))?;
    if json {
        println!("{}", serde_json::to_string_pretty(&v)?);
        return Ok(());
    }
    if v["ok"].as_bool().unwrap_or(false) {
        println!("Success");
    } else {
        println!("Failed");
    }
    Ok(())
}

pub fn call_post(token: &str, method: &str, body: Value, json: bool) -> Result<Vec<u8>> {
    let url = api_url(token, method);
    let resp = crate::requests::request("POST", &url, Some(body.to_string().as_bytes()), &[])
        .map_err(|e| anyhow!("{e}"))?;
    print_result(&resp, json)?;
    Ok(resp)
}

pub fn call_post_raw(token: &str, method: &str, body: Option<Value>) -> Result<Vec<u8>> {
    let url = api_url(token, method);
    let bytes = body.map(|b| b.to_string().into_bytes());
    crate::requests::request("POST", &url, bytes.as_deref(), &[]).map_err(|e| anyhow!("{e}"))
}

pub fn call_get_raw(token: &str, method: &str) -> Result<Vec<u8>> {
    let url = api_url(token, method);
    crate::requests::request("GET", &url, None, &[]).map_err(|e| anyhow!("{e}"))
}

pub fn pretty(v: &Value) -> Result<()> {
    println!("{}", serde_json::to_string_pretty(v)?);
    Ok(())
}
