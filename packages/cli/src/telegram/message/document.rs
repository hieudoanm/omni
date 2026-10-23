use anyhow::Result;
use serde_json::{json, Map, Value};

#[derive(clap::Args)]
pub struct Args {
    /// Target chat ID or @username
    #[arg(long = "chat-id", default_value = "")]
    pub chat_id: String,
    /// Document URL, file_id, or file path
    #[arg(long = "document", default_value = "")]
    pub document: String,
    /// Caption for the document
    #[arg(long = "caption", default_value = "")]
    pub caption: String,
    /// Parse mode: HTML, MarkdownV2, Markdown
    #[arg(long = "parse-mode", default_value = "")]
    pub parse_mode: String,
    /// Thumbnail URL or file_id
    #[arg(long = "thumbnail", default_value = "")]
    pub thumbnail: String,
    /// Disable file type detection
    #[arg(long = "disable-content-type-detection", default_value_t = false)]
    pub disable_content_type_detection: bool,
    /// Send silently
    #[arg(long = "disable-notification", default_value_t = false)]
    pub disable_notification: bool,
    /// Protect forwarded content
    #[arg(long = "protect-content", default_value_t = false)]
    pub protect_content: bool,
    /// Reply to a message
    #[arg(long = "reply-to-message-id", default_value_t = 0)]
    pub reply_to_message_id: i64,
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
    if args.document.is_empty() {
        anyhow::bail!("--document is required");
    }
    let mut body = Map::new();
    body.insert("chat_id".into(), json!(args.chat_id));
    body.insert("document".into(), json!(args.document));
    if !args.caption.is_empty() {
        body.insert("caption".into(), json!(args.caption));
    }
    if !args.parse_mode.is_empty() {
        body.insert("parse_mode".into(), json!(args.parse_mode));
    }
    if !args.thumbnail.is_empty() {
        body.insert("thumbnail".into(), json!(args.thumbnail));
    }
    if args.disable_content_type_detection {
        body.insert("disable_content_type_detection".into(), json!(true));
    }
    if args.disable_notification {
        body.insert("disable_notification".into(), json!(true));
    }
    if args.protect_content {
        body.insert("protect_content".into(), json!(true));
    }
    if args.reply_to_message_id != 0 {
        body.insert(
            "reply_to_message_id".into(),
            json!(args.reply_to_message_id),
        );
    }
    crate::telegram::internal::call_post(&token, "sendDocument", Value::Object(body), args.json)?;
    Ok(())
}
