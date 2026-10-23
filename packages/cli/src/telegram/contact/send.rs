use anyhow::Result;
use serde_json::{json, Map, Value};

#[derive(clap::Args)]
pub struct Args {
    /// Target chat ID or @username
    #[arg(long = "chat-id", default_value = "")]
    pub chat_id: String,
    /// Contact's phone number
    #[arg(long = "phone-number", default_value = "")]
    pub phone_number: String,
    /// Contact's first name
    #[arg(long = "first-name", default_value = "")]
    pub first_name: String,
    /// Contact's last name
    #[arg(long = "last-name", default_value = "")]
    pub last_name: String,
    /// Additional vCard data
    #[arg(long = "vcard", default_value = "")]
    pub vcard: String,
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
    if args.phone_number.is_empty() {
        anyhow::bail!("--phone-number is required");
    }
    if args.first_name.is_empty() {
        anyhow::bail!("--first-name is required");
    }
    let mut body = Map::new();
    body.insert("chat_id".into(), json!(args.chat_id));
    body.insert("phone_number".into(), json!(args.phone_number));
    body.insert("first_name".into(), json!(args.first_name));
    if !args.last_name.is_empty() {
        body.insert("last_name".into(), json!(args.last_name));
    }
    if !args.vcard.is_empty() {
        body.insert("vcard".into(), json!(args.vcard));
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
    crate::telegram::internal::call_post(&token, "sendContact", Value::Object(body), args.json)?;
    Ok(())
}
