use anyhow::Result;
use serde_json::{json, Map, Value};

#[derive(clap::Args)]
pub struct Args {
    /// Callback query ID
    #[arg(long = "callback-query-id", default_value = "")]
    pub callback_query_id: String,
    /// Notification text
    #[arg(long = "text", default_value = "")]
    pub text: String,
    /// Show alert instead of toast
    #[arg(long = "show-alert", default_value_t = false)]
    pub show_alert: bool,
    /// URL to open
    #[arg(long = "url", default_value = "")]
    pub url: String,
    /// Cache time in seconds
    #[arg(long = "cache-time", default_value_t = 0)]
    pub cache_time: i64,
    /// Telegram Bot API token (or TELEGRAM_BOT_TOKEN)
    #[arg(long, short = 't', global = true, default_value = "")]
    pub token: String,
    /// Output in JSON format
    #[arg(long, short = 'j', global = true, default_value_t = false)]
    pub json: bool,
}

pub fn run(args: &Args) -> Result<()> {
    let token = crate::telegram::internal::resolve_token(&args.token)?;
    if args.callback_query_id.is_empty() {
        anyhow::bail!("--callback-query-id is required");
    }
    let mut body = Map::new();
    body.insert("callback_query_id".into(), json!(args.callback_query_id));
    if !args.text.is_empty() {
        body.insert("text".into(), json!(args.text));
    }
    if args.show_alert {
        body.insert("show_alert".into(), json!(true));
    }
    if !args.url.is_empty() {
        body.insert("url".into(), json!(args.url));
    }
    if args.cache_time != 0 {
        body.insert("cache_time".into(), json!(args.cache_time));
    }
    crate::telegram::internal::call_post(
        &token,
        "answerCallbackQuery",
        Value::Object(body),
        args.json,
    )?;
    Ok(())
}
