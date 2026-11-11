use anyhow::Result;
use serde_json::{json, Map, Value};

#[derive(clap::Args)]
pub struct Args {
    /// Target chat ID or @username
    #[arg(long = "chat-id", default_value = "")]
    pub chat_id: String,
    /// Video note URL, file_id, or file path
    #[arg(long = "video-note", default_value = "")]
    pub video_note: String,
    /// Duration in seconds
    #[arg(long = "duration", default_value_t = 0)]
    pub duration: i64,
    /// Video width and height in pixels
    #[arg(long = "length", default_value_t = 0)]
    pub length: i64,
    /// Thumbnail URL or file_id
    #[arg(long = "thumbnail", default_value = "")]
    pub thumbnail: String,
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
    if args.video_note.is_empty() {
        anyhow::bail!("--video-note is required");
    }
    let mut body = Map::new();
    body.insert("chat_id".into(), json!(args.chat_id));
    body.insert("video_note".into(), json!(args.video_note));
    if args.duration != 0 {
        body.insert("duration".into(), json!(args.duration));
    }
    if args.length != 0 {
        body.insert("length".into(), json!(args.length));
    }
    if !args.thumbnail.is_empty() {
        body.insert("thumbnail".into(), json!(args.thumbnail));
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
    crate::telegram::internal::call_post(&token, "sendVideoNote", Value::Object(body), args.json)?;
    Ok(())
}
