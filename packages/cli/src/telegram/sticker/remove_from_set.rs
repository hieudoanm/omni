use anyhow::Result;
use serde_json::{json, Map, Value};

#[derive(clap::Args)]
pub struct Args {
    /// File ID of the sticker to remove
    #[arg(long = "sticker", default_value = "")]
    pub sticker: String,
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
    let mut body = Map::new();
    body.insert("sticker".into(), json!(args.sticker));
    crate::telegram::internal::call_post(
        &token,
        "removeStickerFromSet",
        Value::Object(body),
        args.json,
    )?;
    Ok(())
}
