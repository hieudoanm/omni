use anyhow::Result;
use serde_json::{json, Map, Value};

#[derive(clap::Args)]
pub struct Args {
    /// Inline query ID
    #[arg(long = "inline-query-id", default_value = "")]
    pub inline_query_id: String,
    /// JSON array of result objects
    #[arg(long = "results", default_value = "")]
    pub results: String,
    /// Cache time in seconds
    #[arg(long = "cache-time", default_value_t = 300)]
    pub cache_time: i64,
    /// Results are personal to the user
    #[arg(long = "is-personal", default_value_t = false)]
    pub is_personal: bool,
    /// Offset for pagination
    #[arg(long = "next-offset", default_value = "")]
    pub next_offset: String,
    /// JSON object with button data
    #[arg(long = "button", default_value = "")]
    pub button: String,
    /// Telegram Bot API token (or TELEGRAM_BOT_TOKEN)
    #[arg(long, short = 't', global = true, default_value = "")]
    pub token: String,
    /// Output in JSON format
    #[arg(long, short = 'j', global = true, default_value_t = false)]
    pub json: bool,
}

pub fn run(args: &Args) -> Result<()> {
    let token = crate::telegram::internal::resolve_token(&args.token)?;
    if args.inline_query_id.is_empty() {
        anyhow::bail!("--inline-query-id is required");
    }
    if args.results.is_empty() {
        anyhow::bail!("--results is required (JSON array)");
    }
    let mut body = Map::new();
    let results: Value = serde_json::from_str(&args.results)
        .map_err(|e| anyhow::anyhow!("invalid --results JSON: {e}"))?;
    body.insert("inline_query_id".into(), json!(args.inline_query_id));
    body.insert("results".into(), results.clone());
    if args.cache_time != 0 {
        body.insert("cache_time".into(), json!(args.cache_time));
    }
    if args.is_personal {
        body.insert("is_personal".into(), json!(true));
    }
    if !args.next_offset.is_empty() {
        body.insert("next_offset".into(), json!(args.next_offset));
    }
    if !args.button.is_empty() {
        let button: Value = serde_json::from_str(&args.button)
            .map_err(|e| anyhow::anyhow!("invalid --button JSON: {e}"))?;
        body.insert("button".into(), button);
    }
    crate::telegram::internal::call_post(
        &token,
        "answerInlineQuery",
        Value::Object(body),
        args.json,
    )?;
    Ok(())
}
