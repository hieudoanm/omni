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
    /// Venue name
    #[arg(long = "title", default_value = "")]
    pub title: String,
    /// Venue address
    #[arg(long = "address", default_value = "")]
    pub address: String,
    /// Foursquare venue ID
    #[arg(long = "foursquare-id", default_value = "")]
    pub foursquare_id: String,
    /// Foursquare venue type
    #[arg(long = "foursquare-type", default_value = "")]
    pub foursquare_type: String,
    /// Google Place ID
    #[arg(long = "google-place-id", default_value = "")]
    pub google_place_id: String,
    /// Google Place type
    #[arg(long = "google-place-type", default_value = "")]
    pub google_place_type: String,
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
    if args.title.is_empty() {
        anyhow::bail!("--title is required");
    }
    if args.address.is_empty() {
        anyhow::bail!("--address is required");
    }
    let mut body = Map::new();
    body.insert("chat_id".into(), json!(args.chat_id));
    body.insert("latitude".into(), json!(args.latitude));
    body.insert("longitude".into(), json!(args.longitude));
    body.insert("title".into(), json!(args.title));
    body.insert("address".into(), json!(args.address));
    if !args.foursquare_id.is_empty() {
        body.insert("foursquare_id".into(), json!(args.foursquare_id));
    }
    if !args.foursquare_type.is_empty() {
        body.insert("foursquare_type".into(), json!(args.foursquare_type));
    }
    if !args.google_place_id.is_empty() {
        body.insert("google_place_id".into(), json!(args.google_place_id));
    }
    if !args.google_place_type.is_empty() {
        body.insert("google_place_type".into(), json!(args.google_place_type));
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
    crate::telegram::internal::call_post(&token, "sendVenue", Value::Object(body), args.json)?;
    Ok(())
}
