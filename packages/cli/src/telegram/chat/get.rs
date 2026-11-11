use anyhow::Result;
use serde_json::{json, Map, Value};

#[derive(clap::Args)]
pub struct Args {
    /// Target chat ID or @username
    #[arg(long = "chat-id", default_value = "")]
    pub chat_id: String,
    /// Telegram Bot API token (or TELEGRAM_BOT_TOKEN)
    #[arg(long, short = 't', global = true, default_value = "")]
    pub token: String,
    /// Output in JSON format
    #[arg(long, short = 'j', global = true, default_value_t = false)]
    pub json: bool,
}

pub fn run(args: &Args) -> Result<()> {
    let token = crate::telegram::internal::resolve_token(&args.token)?;
    if args.chat_id.is_empty() {
        anyhow::bail!("--chat-id is required");
    }
    let mut body = Map::new();
    body.insert("chat_id".into(), json!(args.chat_id));
    let body_bytes =
        crate::telegram::internal::call_post_raw(&token, "getChat", Some(Value::Object(body)))?;
    let v: Value = serde_json::from_slice(&body_bytes)?;
    if args.json {
        crate::telegram::internal::pretty(&v)?;
    } else if let Some(info) = v["result"].as_object() {
        let g = |k: &str| {
            info.get(k)
                .map(|x| match x {
                    serde_json::Value::String(s) => s.clone(),
                    other => other.to_string(),
                })
                .unwrap_or_default()
        };
        println!("ID: {}", g("id"));
        println!("Type: {}", g("type"));
        if info.get("title").is_some() {
            println!("Title: {}", g("title"));
        }
        if info.get("username").is_some() {
            println!("Username: {}", g("username"));
        }
    } else {
        println!("Success");
    }
    Ok(())
}
