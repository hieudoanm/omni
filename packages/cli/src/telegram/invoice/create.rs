use anyhow::Result;
use serde_json::{json, Map, Value};

#[derive(clap::Args)]
pub struct Args {
    /// Product title
    #[arg(long = "title", default_value = "")]
    pub title: String,
    /// Product description
    #[arg(long = "description", default_value = "")]
    pub description: String,
    /// Bot-defined payload JSON
    #[arg(long = "payload", default_value = "")]
    pub payload: String,
    /// Currency (XTR for Stars, or fiat code)
    #[arg(long = "currency", default_value = "XTR")]
    pub currency: String,
    /// JSON array of labeled price objects
    #[arg(long = "prices", default_value = "")]
    pub prices: String,
    /// Maximum tip amount
    #[arg(long = "max-tip-amount", default_value_t = 0)]
    pub max_tip_amount: i64,
    /// JSON array of suggested tip amounts
    #[arg(long = "suggested-tip-amounts", default_value = "")]
    pub suggested_tip_amounts: String,
    /// Payment provider token
    #[arg(long = "provider-token", default_value = "")]
    pub provider_token: String,
    /// Ask for user's full name
    #[arg(long = "need-name", default_value_t = false)]
    pub need_name: bool,
    /// Ask for phone number
    #[arg(long = "need-phone", default_value_t = false)]
    pub need_phone: bool,
    /// Ask for email
    #[arg(long = "need-email", default_value_t = false)]
    pub need_email: bool,
    /// Ask for shipping address
    #[arg(long = "need-shipping-address", default_value_t = false)]
    pub need_shipping_address: bool,
    /// Send phone to provider
    #[arg(long = "send-phone-to-provider", default_value_t = false)]
    pub send_phone_to_provider: bool,
    /// Send email to provider
    #[arg(long = "send-email-to-provider", default_value_t = false)]
    pub send_email_to_provider: bool,
    /// Final price depends on shipping
    #[arg(long = "is-flexible", default_value_t = false)]
    pub is_flexible: bool,
    /// Telegram Bot API token (or TELEGRAM_BOT_TOKEN)
    #[arg(long, short = 't', global = true, default_value = "")]
    pub token: String,
    /// Output in JSON format
    #[arg(long, short = 'j', global = true, default_value_t = false)]
    pub json: bool,
}

pub fn run(args: &Args) -> Result<()> {
    let token = crate::telegram::internal::resolve_token(&args.token)?;
    if args.title.is_empty() {
        anyhow::bail!("--title is required");
    }
    if args.description.is_empty() {
        anyhow::bail!("--description is required");
    }
    if args.payload.is_empty() {
        anyhow::bail!("--payload is required");
    }
    if args.currency.is_empty() {
        anyhow::bail!("--currency is required");
    }
    if args.prices.is_empty() {
        anyhow::bail!("--prices is required (JSON array)");
    }
    let mut body = Map::new();
    let prices: Value = serde_json::from_str(&args.prices)
        .map_err(|e| anyhow::anyhow!("invalid --prices JSON: {e}"))?;
    body.insert("title".into(), json!(args.title));
    body.insert("description".into(), json!(args.description));
    body.insert("payload".into(), json!(args.payload));
    body.insert("currency".into(), json!(args.currency));
    body.insert("prices".into(), prices.clone());
    if args.max_tip_amount != 0 {
        body.insert("max_tip_amount".into(), json!(args.max_tip_amount));
    }
    if !args.provider_token.is_empty() {
        body.insert("provider_token".into(), json!(args.provider_token));
    }
    if args.need_name {
        body.insert("need_name".into(), json!(true));
    }
    if args.need_phone {
        body.insert("need_phone_number".into(), json!(true));
    }
    if args.need_email {
        body.insert("need_email".into(), json!(true));
    }
    if args.need_shipping_address {
        body.insert("need_shipping_address".into(), json!(true));
    }
    if args.send_phone_to_provider {
        body.insert("send_phone_number_to_provider".into(), json!(true));
    }
    if args.send_email_to_provider {
        body.insert("send_email_to_provider".into(), json!(true));
    }
    if args.is_flexible {
        body.insert("is_flexible".into(), json!(true));
    }
    if !args.suggested_tip_amounts.is_empty() {
        let amounts: Value = serde_json::from_str(&args.suggested_tip_amounts)
            .map_err(|e| anyhow::anyhow!("invalid --suggested-tip-amounts JSON: {e}"))?;
        body.insert("suggested_tip_amounts".into(), amounts);
    }
    crate::telegram::internal::call_post(
        &token,
        "createInvoiceLink",
        Value::Object(body),
        args.json,
    )?;
    Ok(())
}
