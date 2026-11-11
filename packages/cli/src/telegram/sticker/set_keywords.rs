use anyhow::Result;
use serde_json::{json, Map, Value};

#[derive(clap::Args)]
pub struct Args {
    /// File ID of the sticker
    #[arg(long = "sticker", default_value = "")]
    pub sticker: String,
    /// JSON array of keyword strings
    #[arg(long = "keywords", default_value = "")]
    pub keywords: String,
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
    if args.keywords.is_empty() {
        anyhow::bail!("--keywords is required (JSON array)");
    }
    let mut body = Map::new();
    let keywords: Value = serde_json::from_str(&args.keywords)
        .map_err(|e| anyhow::anyhow!("invalid --keywords JSON: {e}"))?;
    body.insert("sticker".into(), json!(args.sticker));
    body.insert("keywords".into(), keywords.clone());
    crate::telegram::internal::call_post(
        &token,
        "setStickerKeywords",
        Value::Object(body),
        args.json,
    )?;
    Ok(())
}
