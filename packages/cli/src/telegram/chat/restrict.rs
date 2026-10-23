use anyhow::Result;
use serde_json::{json, Map, Value};

#[derive(clap::Args)]
pub struct Args {
    /// Target chat ID or @username
    #[arg(long = "chat-id", default_value = "")]
    pub chat_id: String,
    /// User ID to restrict
    #[arg(long = "user-id", default_value_t = 0)]
    pub user_id: i64,
    /// JSON object with permission flags
    #[arg(long = "permissions", default_value = "")]
    pub permissions: String,
    /// Date when restrictions expire (Unix time)
    #[arg(long = "until-date", default_value_t = 0)]
    pub until_date: i64,
    /// Set permissions independently
    #[arg(long = "use-independent-chat-permissions", default_value_t = false)]
    pub use_independent_chat_permissions: bool,
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
    if args.permissions.is_empty() {
        anyhow::bail!("--permissions is required (JSON object)");
    }
    let mut body = Map::new();
    let permissions: Value = serde_json::from_str(&args.permissions)
        .map_err(|e| anyhow::anyhow!("invalid --permissions JSON: {e}"))?;
    body.insert("chat_id".into(), json!(args.chat_id));
    body.insert("user_id".into(), json!(args.user_id));
    body.insert("permissions".into(), permissions.clone());
    if args.until_date != 0 {
        body.insert("until_date".into(), json!(args.until_date));
    }
    if args.use_independent_chat_permissions {
        body.insert("use_independent_chat_permissions".into(), json!(true));
    }
    crate::telegram::internal::call_post(
        &token,
        "restrictChatMember",
        Value::Object(body),
        args.json,
    )?;
    Ok(())
}
