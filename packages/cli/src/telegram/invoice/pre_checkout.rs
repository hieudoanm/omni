use anyhow::Result;
use serde_json::{json, Map, Value};

#[derive(clap::Args)]
pub struct Args {
    /// Pre-checkout query ID
    #[arg(long = "pre-checkout-query-id", default_value = "")]
    pub pre_checkout_query_id: String,
    /// Approve the pre-checkout query
    #[arg(long = "ok", default_value_t = true)]
    pub ok: bool,
    /// Error message (required if ok=false)
    #[arg(long = "error-message", default_value = "")]
    pub error_message: String,
    /// Telegram Bot API token (or TELEGRAM_BOT_TOKEN)
    #[arg(long, short = 't', global = true, default_value = "")]
    pub token: String,
    /// Output in JSON format
    #[arg(long, short = 'j', global = true, default_value_t = false)]
    pub json: bool,
}

pub fn run(args: &Args) -> Result<()> {
    let token = crate::telegram::internal::resolve_token(&args.token)?;
    if args.pre_checkout_query_id.is_empty() {
        anyhow::bail!("--pre-checkout-query-id is required");
    }
    let mut body = Map::new();
    body.insert(
        "pre_checkout_query_id".into(),
        json!(args.pre_checkout_query_id),
    );
    body.insert("ok".into(), json!(args.ok));
    if !args.ok && !args.error_message.is_empty() {
        body.insert("error_message".into(), json!(args.error_message));
    }
    crate::telegram::internal::call_post(
        &token,
        "answerPreCheckoutQuery",
        Value::Object(body),
        args.json,
    )?;
    Ok(())
}
