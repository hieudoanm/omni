//! OpenRouter API helpers (models, probe, generate).
use crate::requests;
use anyhow::{anyhow, Result};
use serde::{Deserialize, Serialize};
use std::time::{Duration, Instant};

pub const BASE_URL: &str = "https://openrouter.ai/api/v1";

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Model {
    pub id: String,
    pub name: String,
    #[serde(default)]
    pub description: String,
    #[serde(default, rename = "context_length")]
    pub context_length: i64,
    #[serde(default)]
    pub pricing: Pricing,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct Pricing {
    #[serde(default)]
    pub prompt: String,
    #[serde(default)]
    pub completion: String,
    #[serde(default)]
    pub request: String,
}

fn is_free(p: &Pricing) -> bool {
    (p.prompt.is_empty() || p.prompt == "0") && (p.completion.is_empty() || p.completion == "0")
}

pub fn fetch_free_models() -> Result<Vec<Model>> {
    let agent = ureq::Agent::config_builder()
        .timeout_global(Some(Duration::from_secs(120)))
        .build()
        .new_agent();
    let body = agent
        .get(&format!("{BASE_URL}/models"))
        .call()
        .map_err(|e| anyhow!("request failed: {e}"))?
        .into_body()
        .read_to_string()
        .map_err(|e| anyhow!("read: {e}"))?;
    #[derive(Deserialize)]
    struct Resp {
        data: Vec<Model>,
    }
    let payload: Resp = serde_json::from_str(&body).map_err(|e| anyhow!("decode error: {e}"))?;
    let mut free: Vec<Model> = payload
        .data
        .into_iter()
        .filter(|m| is_free(&m.pricing))
        .collect();
    free.sort_by(|a, b| a.id.cmp(&b.id));
    Ok(free)
}

#[allow(dead_code)]
pub fn resolve_model(query: &str, models: &[Model]) -> Option<Model> {
    let q = query.to_lowercase();
    for m in models {
        if m.id.to_lowercase() == q {
            return Some(m.clone());
        }
    }
    for m in models {
        if m.id.to_lowercase() == format!("{q}:free") {
            return Some(m.clone());
        }
    }
    let id_matches: Vec<&Model> = models
        .iter()
        .filter(|m| m.id.to_lowercase().contains(&q))
        .collect();
    if id_matches.len() == 1 {
        return Some(id_matches[0].clone());
    }
    if id_matches.len() > 1 {
        let mut sorted = id_matches;
        sorted.sort_by(|a, b| {
            let af = a.id.ends_with(":free");
            let bf = b.id.ends_with(":free");
            bf.cmp(&af).then(a.id.len().cmp(&b.id.len()))
        });
        return Some(sorted[0].clone());
    }
    let name_matches: Vec<&Model> = models
        .iter()
        .filter(|m| m.name.to_lowercase().contains(&q))
        .collect();
    if !name_matches.is_empty() {
        let mut sorted = name_matches;
        sorted.sort_by_key(|m| m.id.len());
        return Some(sorted[0].clone());
    }
    None
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize)]
#[serde(rename_all = "snake_case")]
pub enum ProbeStatus {
    Ok,
    RateLimited,
    Restricted,
    Error,
}

impl ProbeStatus {
    pub fn as_str(&self) -> &'static str {
        match self {
            ProbeStatus::Ok => "ok",
            ProbeStatus::RateLimited => "rate_limited",
            ProbeStatus::Restricted => "restricted",
            ProbeStatus::Error => "error",
        }
    }
}

#[derive(Debug, Clone, Serialize)]
pub struct ProbeResult {
    pub model: Model,
    pub status: ProbeStatus,
    #[serde(skip_serializing_if = "String::is_empty")]
    pub message: String,
    pub latency_ms: i64,
}

fn extract_message(raw: &[u8]) -> String {
    if let Ok(v) = serde_json::from_slice::<serde_json::Value>(raw) {
        if let Some(msg) = v.pointer("/error/message").and_then(|m| m.as_str()) {
            let msg = msg.to_string();
            return if msg.chars().count() > 80 {
                format!("{}...", msg.chars().take(77).collect::<String>())
            } else {
                msg
            };
        }
    }
    String::new()
}

pub fn probe_model(m: &Model, api_key: &str) -> ProbeResult {
    let payload = serde_json::json!({
        "model": m.id,
        "messages": [{"role": "user", "content": "hi"}],
        "max_tokens": 1,
        "provider": {"allow_fallbacks": false, "data_collection": "allow"},
    });
    let start = Instant::now();
    let headers: Vec<(String, String)> = vec![
        ("Content-Type".into(), "application/json".into()),
        ("Authorization".into(), format!("Bearer {api_key}")),
        (
            "HTTP-Referer".into(),
            "https://github.com/freerouter/freerouter".into(),
        ),
        ("X-Title".into(), "freerouter".into()),
    ];
    let result = requests::request_status(
        "POST",
        &format!("{BASE_URL}/chat/completions"),
        Some(payload.to_string().as_bytes()),
        &headers,
    );
    let elapsed = start.elapsed().as_millis() as i64;
    match result {
        Ok((status, body)) => match status {
            200 => ProbeResult {
                model: m.clone(),
                status: ProbeStatus::Ok,
                message: String::new(),
                latency_ms: elapsed,
            },
            429 => ProbeResult {
                model: m.clone(),
                status: ProbeStatus::RateLimited,
                message: extract_message(&body),
                latency_ms: elapsed,
            },
            404 => ProbeResult {
                model: m.clone(),
                status: ProbeStatus::Restricted,
                message: extract_message(&body),
                latency_ms: elapsed,
            },
            _ => {
                let msg = extract_message(&body);
                ProbeResult {
                    model: m.clone(),
                    status: ProbeStatus::Error,
                    message: if msg.is_empty() {
                        format!("HTTP {status}")
                    } else {
                        msg
                    },
                    latency_ms: elapsed,
                }
            }
        },
        Err(e) => ProbeResult {
            model: m.clone(),
            status: ProbeStatus::Error,
            message: e.to_string(),
            latency_ms: elapsed,
        },
    }
}

#[derive(Serialize)]
struct GenerateRequest {
    model: String,
    messages: Vec<GenerateMsg>,
    #[serde(skip_serializing_if = "Option::is_none")]
    max_tokens: Option<i64>,
}

#[derive(Serialize, Deserialize, Clone)]
struct GenerateMsg {
    role: String,
    content: String,
}

#[derive(Deserialize)]
struct GenerateResponse {
    choices: Vec<Choice>,
    error: Option<ErrorMsg>,
}

#[derive(Deserialize)]
struct Choice {
    message: GenerateMsg,
}

#[derive(Deserialize)]
struct ErrorMsg {
    message: String,
}

pub fn generate(model: &str, prompt: &str) -> Result<String> {
    let api_key = super::config::load_api_key();
    if api_key.is_empty() {
        return Err(anyhow!("OpenRouter API key not found"));
    }
    let body = GenerateRequest {
        model: model.to_string(),
        messages: vec![GenerateMsg {
            role: "user".into(),
            content: prompt.to_string(),
        }],
        max_tokens: Some(2048),
    };
    let body_bytes = serde_json::to_vec(&body)?;
    let (status, resp_body) = requests::request_status(
        "POST",
        &format!("{BASE_URL}/chat/completions"),
        Some(&body_bytes),
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
    .map_err(|e| anyhow!("request failed: {e}"))?;
    if status != 200 {
        if let Ok(err_resp) = serde_json::from_slice::<GenerateResponse>(&resp_body) {
            if let Some(e) = err_resp.error {
                return Err(anyhow!("OpenRouter error: {}", e.message));
            }
        }
        return Err(anyhow!("OpenRouter returned HTTP {status}"));
    }
    let result: GenerateResponse =
        serde_json::from_slice(&resp_body).map_err(|e| anyhow!("decode response: {e}"))?;
    if result.choices.is_empty() {
        return Err(anyhow!("no choices returned"));
    }
    Ok(result.choices[0].message.content.clone())
}
