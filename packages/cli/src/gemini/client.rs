//! Minimal Gemini generateContent client (mirrors libs/api/gemini.google.com).
use anyhow::{anyhow, Result};
use serde::{Deserialize, Serialize};
use serde_json::json;

#[derive(Clone, Copy)]
pub struct Model {
    pub id: &'static str,
    pub name: &'static str,
}

pub const MODELS: [Model; 9] = [
    Model {
        id: "gemini-3.5-flash",
        name: "Gemini 3.5 Flash",
    },
    Model {
        id: "gemini-3.1-flash-lite",
        name: "Gemini 3.1 Flash-Lite",
    },
    Model {
        id: "gemini-3.1-pro-preview",
        name: "Gemini 3.1 Pro Preview",
    },
    Model {
        id: "gemini-3-flash-preview",
        name: "Gemini 3 Flash Preview",
    },
    Model {
        id: "gemini-2.5-pro",
        name: "Gemini 2.5 Pro",
    },
    Model {
        id: "gemini-2.5-flash",
        name: "Gemini 2.5 Flash",
    },
    Model {
        id: "gemini-2.5-flash-lite",
        name: "Gemini 2.5 Flash-Lite",
    },
    Model {
        id: "gemini-2.0-flash",
        name: "Gemini 2.0 Flash",
    },
    Model {
        id: "gemini-2.0-flash-lite",
        name: "Gemini 2.0 Flash Lite",
    },
];

#[derive(Serialize, Deserialize, Clone)]
pub struct Content {
    pub role: String,
    pub parts: Vec<PartOwned>,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct PartOwned {
    pub text: String,
}

#[derive(Deserialize)]
struct Response {
    candidates: Vec<Candidate>,
    #[serde(rename = "usageMetadata")]
    usage_metadata: Option<UsageMetadata>,
}

#[derive(Deserialize)]
struct Candidate {
    content: Content,
}

#[derive(Deserialize)]
struct UsageMetadata {
    #[serde(rename = "totalTokenCount")]
    total_token_count: i64,
}

pub fn model_name(id: &str) -> &str {
    MODELS
        .iter()
        .find(|m| m.id == id)
        .map(|m| m.name)
        .unwrap_or(id)
}

/// Send contents to Gemini and return (text, total tokens).
pub fn generate(model: &str, messages: &[Content]) -> Result<(String, i64)> {
    let api_key = std::env::var("GEMINI_API_KEY").map_err(|_| anyhow!("GEMINI_API_KEY not set"))?;
    let url = format!(
        "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
    );
    let body = json!({ "contents": messages });
    let bytes = crate::requests::request("POST", &url, Some(body.to_string().as_bytes()), &[])
        .map_err(|e| anyhow!("API request: {e}"))?;
    let resp: Response = serde_json::from_slice(&bytes).map_err(|e| anyhow!("API request: {e}"))?;
    let cand = resp
        .candidates
        .first()
        .ok_or_else(|| anyhow!("no candidates returned"))?;
    let text = cand
        .content
        .parts
        .first()
        .map(|p| p.text.clone())
        .unwrap_or_default();
    let tokens = resp
        .usage_metadata
        .map(|u| u.total_token_count)
        .unwrap_or(0);
    Ok((text, tokens))
}
