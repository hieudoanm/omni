use anyhow::Result;
use serde_json::{json, Map, Value};

#[derive(clap::Args)]
pub struct Args {
    /// Target chat ID or @username
    #[arg(long = "chat-id", default_value = "")]
    pub chat_id: String,
    /// Poll question
    #[arg(long = "question", default_value = "")]
    pub question: String,
    /// JSON array of option objects
    #[arg(long = "options", default_value = "")]
    pub options: String,
    /// Poll type: regular or quiz
    #[arg(long = "type", default_value = "")]
    pub r#type: String,
    /// Poll is anonymous
    #[arg(long = "is-anonymous", default_value_t = true)]
    pub is_anonymous: bool,
    /// Allow multiple answers
    #[arg(long = "allows-multiple-answers", default_value_t = false)]
    pub allows_multiple_answers: bool,
    /// JSON array of correct option indices (for quiz)
    #[arg(long = "correct-option-ids", default_value = "")]
    pub correct_option_ids: String,
    /// Poll open period in seconds
    #[arg(long = "open-period", default_value_t = 0)]
    pub open_period: i64,
    /// Poll close date in Unix time
    #[arg(long = "close-date", default_value_t = 0)]
    pub close_date: i64,
    /// Close the poll immediately
    #[arg(long = "is-closed", default_value_t = false)]
    pub is_closed: bool,
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
    if args.question.is_empty() {
        anyhow::bail!("--question is required");
    }
    if args.options.is_empty() {
        anyhow::bail!("--options is required (JSON array)");
    }
    let mut body = Map::new();
    let options: Value = serde_json::from_str(&args.options)
        .map_err(|e| anyhow::anyhow!("invalid --options JSON: {e}"))?;
    body.insert("chat_id".into(), json!(args.chat_id));
    body.insert("question".into(), json!(args.question));
    body.insert("options".into(), options.clone());
    if !args.r#type.is_empty() {
        body.insert("type".into(), json!(args.r#type));
    }
    if !args.is_anonymous {
        body.insert("is_anonymous".into(), json!(false));
    }
    if args.allows_multiple_answers {
        body.insert("allows_multiple_answers".into(), json!(true));
    }
    if args.open_period != 0 {
        body.insert("open_period".into(), json!(args.open_period));
    }
    if args.close_date != 0 {
        body.insert("close_date".into(), json!(args.close_date));
    }
    if args.is_closed {
        body.insert("is_closed".into(), json!(true));
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
    if !args.correct_option_ids.is_empty() {
        let ids: Value = serde_json::from_str(&args.correct_option_ids)
            .map_err(|e| anyhow::anyhow!("invalid --correct-option-ids JSON: {e}"))?;
        body.insert("correct_option_ids".into(), ids);
    }
    crate::telegram::internal::call_post(&token, "sendPoll", Value::Object(body), args.json)?;
    Ok(())
}
