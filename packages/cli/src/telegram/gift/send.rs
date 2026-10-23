use anyhow::Result;
use serde_json::{json, Map, Value};

#[derive(clap::Args)]
pub struct Args {
    /// Target user ID
    #[arg(long = "user-id", default_value_t = 0)]
    pub user_id: i64,
    /// Gift identifier
    #[arg(long = "gift-id", default_value = "")]
    pub gift_id: String,
    /// Text accompanying the gift
    #[arg(long = "text", default_value = "")]
    pub text: String,
    /// Text parse mode: MarkdownV2/HTML
    #[arg(long = "text-parse-mode", default_value = "")]
    pub text_parse_mode: String,
    /// Protect forwarded content
    #[arg(long = "protect-content", default_value_t = false)]
    pub protect_content: bool,
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
    if args.gift_id.is_empty() {
        anyhow::bail!("--gift-id is required");
    }
    let mut body = Map::new();
    body.insert("user_id".into(), json!(args.user_id));
    body.insert("gift_id".into(), json!(args.gift_id));
    if !args.text.is_empty() {
        body.insert("text".into(), json!(args.text));
    }
    if !args.text_parse_mode.is_empty() {
        body.insert("text_parse_mode".into(), json!(args.text_parse_mode));
    }
    if args.protect_content {
        body.insert("protect_content".into(), json!(true));
    }
    crate::telegram::internal::call_post(&token, "sendGift", Value::Object(body), args.json)?;
    Ok(())
}
