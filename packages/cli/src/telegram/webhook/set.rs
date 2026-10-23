use anyhow::Result;
use serde_json::{json, Map, Value};

#[derive(clap::Args)]
pub struct Args {
    /// Webhook URL (HTTPS)
    #[arg(long = "url", default_value = "")]
    pub url: String,
    /// Telegram Bot API token (or TELEGRAM_BOT_TOKEN)
    #[arg(long, short = 't', global = true, default_value = "")]
    pub token: String,
    /// Output in JSON format
    #[arg(long, short = 'j', global = true, default_value_t = false)]
    pub json: bool,
}

pub fn run(args: &Args) -> Result<()> {
    let token = crate::telegram::internal::resolve_token(&args.token)?;
    if args.url.is_empty() {
        anyhow::bail!("--url is required");
    }
    let mut body = Map::new();
    body.insert("url".into(), json!(args.url));
    crate::telegram::internal::call_post(&token, "setWebhook", Value::Object(body), args.json)?;
    Ok(())
}
