//! Lichess API client (mirrors lichess.org/client.go).
use anyhow::{anyhow, Result};

pub const BASE_URL: &str = "https://lichess.org/api";

pub fn token() -> String {
    std::env::var("LICHESS_API_TOKEN").unwrap_or_default()
}

pub fn do_get(path: &str, params: &[(&str, String)]) -> Result<Vec<u8>> {
    let mut url = format!("{BASE_URL}{path}");
    if !params.is_empty() {
        let qs: Vec<String> = params
            .iter()
            .map(|(k, v)| format!("{}={}", url_encode(k), url_encode(v)))
            .collect();
        url.push('?');
        url.push_str(&qs.join("&"));
    }
    let mut headers = Vec::new();
    let tok = token();
    if !tok.is_empty() {
        headers.push(("Authorization".to_string(), format!("Bearer {tok}")));
    }
    crate::requests::request("GET", &url, None, &headers).map_err(|e| anyhow!("{e}"))
}

pub fn url_encode(s: &str) -> String {
    let mut out = String::new();
    for b in s.bytes() {
        match b {
            b'A'..=b'Z' | b'a'..=b'z' | b'0'..=b'9' | b'-' | b'_' | b'.' | b'~' => {
                out.push(b as char)
            }
            _ => out.push_str(&format!("%{b:02X}")),
        }
    }
    out
}

#[allow(dead_code)]
pub fn params_map<'a>(pairs: &'a [(&'a str, &'a str)]) -> Vec<(&'a str, String)> {
    pairs.iter().map(|(k, v)| (*k, v.to_string())).collect()
}
