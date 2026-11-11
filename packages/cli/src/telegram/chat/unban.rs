use anyhow::Result;
use serde_json::{json, Map, Value};

#[derive(clap::Args)]
pub struct Args {
    /// Target chat ID or @username
    #[arg(long = "chat-id", default_value = "")]
    pub chat_id: String,
    /// User ID to unban
    #[arg(long = "user-id", default_value_t = 0)]
    pub user_id: i64,
    /// Only unban if already banned
    #[arg(long = "only-if-banned", default_value_t = false)]
    pub only_if_banned: bool,
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
    if args.only_if_banned {
        body.insert("only_if_banned".into(), json!(true));
    }
    crate::telegram::internal::call_post(
        &token,
        "unbanChatMember",
        Value::Object(body),
        args.json,
    )?;
    Ok(())
}
