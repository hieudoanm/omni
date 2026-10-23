use anyhow::Result;
use serde_json::{json, Map, Value};

#[derive(clap::Args)]
pub struct Args {
    /// Sticker set short name
    #[arg(long = "name", default_value = "")]
    pub name: String,
    /// New sticker set title
    #[arg(long = "title", default_value = "")]
    pub title: String,
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
    if args.title.is_empty() {
        anyhow::bail!("--title is required");
    }
    let mut body = Map::new();
    body.insert("name".into(), json!(args.name));
    body.insert("title".into(), json!(args.title));
    crate::telegram::internal::call_post(
        &token,
        "setStickerSetTitle",
        Value::Object(body),
        args.json,
    )?;
    Ok(())
}
