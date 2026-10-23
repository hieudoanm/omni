use anyhow::Result;
use serde_json::{json, Map, Value};

#[derive(clap::Args)]
pub struct Args {
    /// Target chat ID or @username
    #[arg(long = "chat-id", default_value = "")]
    pub chat_id: String,
    /// User ID to ban
    #[arg(long = "user-id", default_value_t = 0)]
    pub user_id: i64,
    /// Date when ban expires (Unix time)
    #[arg(long = "until-date", default_value_t = 0)]
    pub until_date: i64,
    /// Delete all user's messages
    #[arg(long = "revoke-messages", default_value_t = false)]
    pub revoke_messages: bool,
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
    if args.user_id == 0 {
        anyhow::bail!("--user-id is required");
    }
    let mut body = Map::new();
    body.insert("chat_id".into(), json!(args.chat_id));
    body.insert("user_id".into(), json!(args.user_id));
    if args.until_date != 0 {
        body.insert("until_date".into(), json!(args.until_date));
    }
    if args.revoke_messages {
        body.insert("revoke_messages".into(), json!(true));
    }
    crate::telegram::internal::call_post(&token, "banChatMember", Value::Object(body), args.json)?;
    Ok(())
}
