use anyhow::Result;
use serde_json::{json, Map, Value};

#[derive(clap::Args)]
pub struct Args {
    /// Target chat ID or @username
    #[arg(long = "chat-id", default_value = "")]
    pub chat_id: String,
    /// Latitude
    #[arg(long = "latitude", default_value_t = 0.0)]
    pub latitude: f64,
    /// Longitude
    #[arg(long = "longitude", default_value_t = 0.0)]
    pub longitude: f64,
    /// Horizontal accuracy in meters
    #[arg(long = "horizontal-accuracy", default_value_t = 0.0)]
    pub horizontal_accuracy: f64,
    /// Live location period in seconds
    #[arg(long = "live-period", default_value_t = 0)]
    pub live_period: i64,
    /// Direction in degrees (1-360)
    #[arg(long = "heading", default_value_t = 0)]
    pub heading: i64,
    /// Proximity alert radius in meters
    #[arg(long = "proximity-alert-radius", default_value_t = 0)]
    pub proximity_alert_radius: i64,
    /// Send silently
    #[arg(long = "disable-notification", default_value_t = false)]
    pub disable_notification: bool,
    /// Protect forwarded content
    #[arg(long = "protect-content", default_value_t = false)]
    pub protect_content: bool,
    /// Reply to a message
    #[arg(long = "reply-to-message-id", default_value_t = 0)]
    pub reply_to_message_id: i64,
    /// Telegram Bot API token (or TELEGRAM_BOT_TOKEN)
    #[arg(long, short = 't', global = true, default_value = "")]
    pub token: String,
    /// Output in JSON format
    #[arg(long, short = 'j', global = true, default_value_t = false)]
    pub json: bool,
}

pub fn run(args: &Args) -> Result<()> {
    let token = crate::telegram::internal::resolve_token(&args.token)?;
    if args.chat_id.is_empty() {
        anyhow::bail!("--chat-id is required");
    }
    let mut body = Map::new();
    body.insert("chat_id".into(), json!(args.chat_id));
    body.insert("latitude".into(), json!(args.latitude));
    body.insert("longitude".into(), json!(args.longitude));
    if args.horizontal_accuracy != 0.0 {
        body.insert(
            "horizontal_accuracy".into(),
            json!(args.horizontal_accuracy),
        );
    }
    if args.live_period != 0 {
        body.insert("live_period".into(), json!(args.live_period));
    }
    if args.heading != 0 {
        body.insert("heading".into(), json!(args.heading));
    }
    if args.proximity_alert_radius != 0 {
        body.insert(
            "proximity_alert_radius".into(),
            json!(args.proximity_alert_radius),
        );
    }
    if args.disable_notification {
        body.insert("disable_notification".into(), json!(true));
    }
    if args.protect_content {
        body.insert("protect_content".into(), json!(true));
    }
    if args.reply_to_message_id != 0 {
        body.insert(
            "reply_to_message_id".into(),
            json!(args.reply_to_message_id),
        );
    }
    crate::telegram::internal::call_post(&token, "sendLocation", Value::Object(body), args.json)?;
    Ok(())
}
