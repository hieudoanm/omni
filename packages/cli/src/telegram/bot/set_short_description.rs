use anyhow::Result;
use serde_json::{json, Map, Value};

#[derive(clap::Args)]
pub struct Args {
    /// New short description (up to 120 chars)
    #[arg(long = "short-description", default_value = "")]
    pub short_description: String,
    /// Language code (e.g. en)
    #[arg(long = "language-code", default_value = "")]
    pub language_code: String,
    /// Telegram Bot API token (or TELEGRAM_BOT_TOKEN)
    #[arg(long, short = 't', global = true, default_value = "")]
    pub token: String,
    /// Output in JSON format
    #[arg(long, short = 'j', global = true, default_value_t = false)]
    pub json: bool,
}

pub fn run(args: &Args) -> Result<()> {
    let token = crate::telegram::internal::resolve_token(&args.token)?;
    if args.short_description.is_empty() {
        anyhow::bail!("--short-description is required");
    }
    let mut body = Map::new();
    body.insert("short_description".into(), json!(args.short_description));
    if !args.language_code.is_empty() {
        body.insert("language_code".into(), json!(args.language_code));
    }
    crate::telegram::internal::call_post(
        &token,
        "setMyShortDescription",
        Value::Object(body),
        args.json,
    )?;
    Ok(())
}
