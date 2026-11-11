use anyhow::Result;
use serde_json::{json, Map, Value};

#[derive(clap::Args)]
pub struct Args {
    /// Target supergroup chat ID or @username
    #[arg(long = "chat-id", default_value = "")]
    pub chat_id: String,
    /// Topic message thread ID
    #[arg(long = "message-thread-id", default_value_t = 0)]
    pub message_thread_id: i64,
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
    if args.message_thread_id == 0 {
        anyhow::bail!("--message-thread-id is required");
    }
    let mut body = Map::new();
    body.insert("chat_id".into(), json!(args.chat_id));
    body.insert("message_thread_id".into(), json!(args.message_thread_id));
    crate::telegram::internal::call_post(
        &token,
        "reopenForumTopic",
        Value::Object(body),
        args.json,
    )?;
    Ok(())
}
