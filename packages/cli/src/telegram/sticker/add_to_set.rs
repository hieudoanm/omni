use anyhow::Result;
use serde_json::{json, Map, Value};

#[derive(clap::Args)]
pub struct Args {
    /// Sticker set owner ID
    #[arg(long = "user-id", default_value_t = 0)]
    pub user_id: i64,
    /// Sticker set short name
    #[arg(long = "name", default_value = "")]
    pub name: String,
    /// JSON object with sticker data
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
    if args.user_id == 0 {
        anyhow::bail!("--user-id is required");
    }
    if args.name.is_empty() {
        anyhow::bail!("--name is required");
    }
    if args.sticker.is_empty() {
        anyhow::bail!("--sticker is required (JSON object)");
    }
    let mut body = Map::new();
    let sticker: Value = serde_json::from_str(&args.sticker)
        .map_err(|e| anyhow::anyhow!("invalid --sticker JSON: {e}"))?;
    body.insert("user_id".into(), json!(args.user_id));
    body.insert("name".into(), json!(args.name));
    body.insert("sticker".into(), sticker.clone());
    crate::telegram::internal::call_post(
        &token,
        "addStickerToSet",
        Value::Object(body),
        args.json,
    )?;
    Ok(())
}
