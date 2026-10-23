use anyhow::Result;
use serde_json::{json, Map, Value};

#[derive(clap::Args)]
pub struct Args {
    /// Target chat ID or @username
    #[arg(long = "chat-id", default_value = "")]
    pub chat_id: String,
    /// Action type (typing, upload_photo, record_video, upload_video, record_voice, upload_voice, upload_document, choose_sticker, find_location, record_video_note, upload_video_note)
    #[arg(long = "action", default_value = "")]
    pub action: String,
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
    if args.action.is_empty() {
        anyhow::bail!("--action is required (typing, upload_photo, record_video, upload_video, record_voice, upload_voice, upload_document, choose_sticker, find_location, record_video_note, upload_video_note)");
    }
    let mut body = Map::new();
    body.insert("chat_id".into(), json!(args.chat_id));
    body.insert("action".into(), json!(args.action));
    crate::telegram::internal::call_post(&token, "sendChatAction", Value::Object(body), args.json)?;
    Ok(())
}
