use anyhow::Result;
use serde_json::{json, Map, Value};

#[derive(clap::Args)]
pub struct Args {
    /// Target supergroup chat ID or @username
    #[arg(long = "chat-id", default_value = "")]
    pub chat_id: String,
    /// Topic name
    #[arg(long = "name", default_value = "")]
    pub name: String,
    /// Color of the topic icon (RGB hex int)
    #[arg(long = "icon-color", default_value_t = 0)]
    pub icon_color: i64,
    /// Custom emoji ID for the topic icon
    #[arg(long = "icon-custom-emoji-id", default_value = "")]
    pub icon_custom_emoji_id: String,
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
    if args.name.is_empty() {
        anyhow::bail!("--name is required");
    }
    let mut body = Map::new();
    body.insert("chat_id".into(), json!(args.chat_id));
    body.insert("name".into(), json!(args.name));
    if args.icon_color != 0 {
        body.insert("icon_color".into(), json!(args.icon_color));
    }
    if !args.icon_custom_emoji_id.is_empty() {
        body.insert(
            "icon_custom_emoji_id".into(),
            json!(args.icon_custom_emoji_id),
        );
    }
    crate::telegram::internal::call_post(
        &token,
        "createForumTopic",
        Value::Object(body),
        args.json,
    )?;
    Ok(())
}
