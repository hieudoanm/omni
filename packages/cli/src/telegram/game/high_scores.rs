use anyhow::Result;
use serde_json::{json, Map, Value};

#[derive(clap::Args)]
pub struct Args {
    /// Target user ID
    #[arg(long = "user-id", default_value_t = 0)]
    pub user_id: i64,
    /// Chat ID (required for non-inline messages)
    #[arg(long = "chat-id", default_value = "")]
    pub chat_id: String,
    /// Message ID (required for non-inline messages)
    #[arg(long = "message-id", default_value_t = 0)]
    pub message_id: i64,
    /// Inline message ID
    #[arg(long = "inline-message-id", default_value = "")]
    pub inline_message_id: String,
    /// Telegram Bot API token (or TELEGRAM_BOT_TOKEN)
    #[arg(long, short = 't', global = true, default_value = "")]
    pub token: String,
    /// Output in JSON format
    #[arg(long, short = 'j', global = true, default_value_t = false)]
    pub json: bool,
}

pub fn run(args: &Args) -> Result<()> {
    let token = crate::telegram::internal::resolve_token(&args.token)?;
    if args.user_id == 0 {
        anyhow::bail!("--user-id is required");
    }
    let mut body = Map::new();
    body.insert("user_id".into(), json!(args.user_id));
    if !args.chat_id.is_empty() {
        body.insert("chat_id".into(), json!(args.chat_id));
    }
    if args.message_id != 0 {
        body.insert("message_id".into(), json!(args.message_id));
    }
    if !args.inline_message_id.is_empty() {
        body.insert("inline_message_id".into(), json!(args.inline_message_id));
    }
    crate::telegram::internal::call_post(
        &token,
        "getGameHighScores",
        Value::Object(body),
        args.json,
    )?;
    Ok(())
}
