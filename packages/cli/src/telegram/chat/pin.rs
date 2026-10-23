use anyhow::Result;
use serde_json::{json, Map, Value};

#[derive(clap::Args)]
pub struct Args {
    /// Target chat ID or @username
    #[arg(long = "chat-id", default_value = "")]
    pub chat_id: String,
    /// Message ID to pin
    #[arg(long = "message-id", default_value_t = 0)]
    pub message_id: i64,
    /// Don't notify chat members
    #[arg(long = "disable-notification", default_value_t = false)]
    pub disable_notification: bool,
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
    if args.message_id == 0 {
        anyhow::bail!("--message-id is required");
    }
    let mut body = Map::new();
    body.insert("chat_id".into(), json!(args.chat_id));
    body.insert("message_id".into(), json!(args.message_id));
    if args.disable_notification {
        body.insert("disable_notification".into(), json!(true));
    }
    crate::telegram::internal::call_post(&token, "pinChatMessage", Value::Object(body), args.json)?;
    Ok(())
}
