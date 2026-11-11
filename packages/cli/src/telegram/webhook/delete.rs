use anyhow::Result;
use serde_json::{Map, Value};

#[derive(clap::Args)]
pub struct Args {
    /// Telegram Bot API token (or TELEGRAM_BOT_TOKEN)
    #[arg(long, short = 't', global = true, default_value = "")]
    pub token: String,
    /// Output in JSON format
    #[arg(long, short = 'j', global = true, default_value_t = false)]
    pub json: bool,
}

pub fn run(args: &Args) -> Result<()> {
    let token = crate::telegram::internal::resolve_token(&args.token)?;
    let body = Map::new();
    crate::telegram::internal::call_post(&token, "deleteWebhook", Value::Object(body), args.json)?;
    Ok(())
}
