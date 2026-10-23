use anyhow::Result;
use serde_json::{json, Map, Value};

#[derive(clap::Args)]
pub struct Args {
    /// Sticker set short name
    #[arg(long = "name", default_value = "")]
    pub name: String,
    /// Sticker set owner ID
    #[arg(long = "user-id", default_value_t = 0)]
    pub user_id: i64,
    /// Thumbnail file ID or URL
    #[arg(long = "thumbnail", default_value = "")]
    pub thumbnail: String,
    /// Thumbnail format: static/animated/video
    #[arg(long = "format", default_value = "static")]
    pub format: String,
    /// Telegram Bot API token (or TELEGRAM_BOT_TOKEN)
    #[arg(long, short = 't', global = true, default_value = "")]
    pub token: String,
    /// Output in JSON format
    #[arg(long, short = 'j', global = true, default_value_t = false)]
    pub json: bool,
}

pub fn run(args: &Args) -> Result<()> {
    let token = crate::telegram::internal::resolve_token(&args.token)?;
    if args.name.is_empty() {
        anyhow::bail!("--name is required (sticker set short name)");
    }
    if args.user_id == 0 {
        anyhow::bail!("--user-id is required");
    }
    if args.thumbnail.is_empty() {
        anyhow::bail!("--thumbnail is required");
    }
    let mut body = Map::new();
    body.insert("name".into(), json!(args.name));
    body.insert("user_id".into(), json!(args.user_id));
    body.insert("thumbnail".into(), json!(args.thumbnail));
    body.insert("format".into(), json!(args.format));
    crate::telegram::internal::call_post(
        &token,
        "setStickerSetThumbnail",
        Value::Object(body),
        args.json,
    )?;
    Ok(())
}
