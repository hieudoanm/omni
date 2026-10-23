use anyhow::Result;
use serde_json::{json, Map, Value};

#[derive(clap::Args)]
pub struct Args {
    /// Target chat ID or @username
    #[arg(long = "chat-id", default_value = "")]
    pub chat_id: String,
    /// Source chat ID or @username
    #[arg(long = "from-chat-id", default_value = "")]
    pub from_chat_id: String,
    /// Message ID to copy
    #[arg(long = "message-id", default_value_t = 0)]
    pub message_id: i64,
    /// New caption for media
    #[arg(long = "caption", default_value = "")]
    pub caption: String,
    /// Parse mode: HTML, MarkdownV2, Markdown
    #[arg(long = "parse-mode", default_value = "")]
    pub parse_mode: String,
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
    if args.from_chat_id.is_empty() {
        anyhow::bail!("--from-chat-id is required");
    }
    if args.message_id == 0 {
        anyhow::bail!("--message-id is required");
    }
    let mut body = Map::new();
    body.insert("chat_id".into(), json!(args.chat_id));
    body.insert("from_chat_id".into(), json!(args.from_chat_id));
    body.insert("message_id".into(), json!(args.message_id));
    if !args.caption.is_empty() {
        body.insert("caption".into(), json!(args.caption));
    }
    if !args.parse_mode.is_empty() {
        body.insert("parse_mode".into(), json!(args.parse_mode));
    }
    crate::telegram::internal::call_post(&token, "copyMessage", Value::Object(body), args.json)?;
    Ok(())
}
