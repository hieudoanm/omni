use anyhow::Result;
use serde_json::{json, Map, Value};

#[derive(clap::Args)]
pub struct Args {
    /// Shipping query ID
    #[arg(long = "shipping-query-id", default_value = "")]
    pub shipping_query_id: String,
    /// Accept the shipping query
    #[arg(long = "ok", default_value_t = true)]
    pub ok: bool,
    /// JSON array of shipping options (required if ok=true)
    #[arg(long = "shipping-options", default_value = "")]
    pub shipping_options: String,
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
    if args.shipping_query_id.is_empty() {
        anyhow::bail!("--shipping-query-id is required");
    }
    let mut body = Map::new();
    body.insert("shipping_query_id".into(), json!(args.shipping_query_id));
    body.insert("ok".into(), json!(args.ok));
    if !args.ok && !args.error_message.is_empty() {
        body.insert("error_message".into(), json!(args.error_message));
    }
    if args.ok && !args.shipping_options.is_empty() {
        let options: Value = serde_json::from_str(&args.shipping_options)
            .map_err(|e| anyhow::anyhow!("invalid --shipping-options JSON: {e}"))?;
        body.insert("shipping_options".into(), options);
    }
    crate::telegram::internal::call_post(
        &token,
        "answerShippingQuery",
        Value::Object(body),
        args.json,
    )?;
    Ok(())
}
