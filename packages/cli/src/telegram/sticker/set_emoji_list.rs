use anyhow::Result;
use serde_json::{json, Map, Value};

#[derive(clap::Args)]
pub struct Args {
    /// File ID of the sticker
    #[arg(long = "sticker", default_value = "")]
    pub sticker: String,
    /// JSON array of emoji strings
    #[arg(long = "emoji-list", default_value = "")]
    pub emoji_list: String,
    /// Telegram Bot API token (or TELEGRAM_BOT_TOKEN)
    #[arg(long, short = 't', global = true, default_value = "")]
    pub token: String,
    /// Output in JSON format
    #[arg(long, short = 'j', global = true, default_value_t = false)]
    pub json: bool,
}

pub fn run(args: &Args) -> Result<()> {
    let token = crate::telegram::internal::resolve_token(&args.token)?;
    if args.sticker.is_empty() {
        anyhow::bail!("--sticker is required");
    }
    if args.emoji_list.is_empty() {
        anyhow::bail!("--emoji-list is required (JSON array)");
    }
    let mut body = Map::new();
    let emoji_list: Value = serde_json::from_str(&args.emoji_list)
        .map_err(|e| anyhow::anyhow!("invalid --emoji-list JSON: {e}"))?;
    body.insert("sticker".into(), json!(args.sticker));
    body.insert("emoji_list".into(), emoji_list.clone());
    crate::telegram::internal::call_post(
        &token,
        "setStickerEmojiList",
        Value::Object(body),
        args.json,
    )?;
    Ok(())
}
