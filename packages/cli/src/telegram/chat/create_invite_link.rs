use anyhow::Result;
use serde_json::{json, Map, Value};

#[derive(clap::Args)]
pub struct Args {
    /// Target chat ID or @username
    #[arg(long = "chat-id", default_value = "")]
    pub chat_id: String,
    /// Invite link name
    #[arg(long = "name", default_value = "")]
    pub name: String,
    /// Expiration Unix timestamp
    #[arg(long = "expire-date", default_value_t = 0)]
    pub expire_date: i64,
    /// Maximum number of users (1-99999)
    #[arg(long = "member-limit", default_value_t = 0)]
    pub member_limit: i64,
    /// Users must request admin approval
    #[arg(long = "creates-join-request", default_value_t = false)]
    pub creates_join_request: bool,
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
    if !args.name.is_empty() {
        body.insert("name".into(), json!(args.name));
    }
    if args.expire_date != 0 {
        body.insert("expire_date".into(), json!(args.expire_date));
    }
    if args.member_limit != 0 {
        body.insert("member_limit".into(), json!(args.member_limit));
    }
    if args.creates_join_request {
        body.insert("creates_join_request".into(), json!(true));
    }
    let body_bytes = crate::telegram::internal::call_post_raw(
        &token,
        "createChatInviteLink",
        Some(Value::Object(body)),
    )?;
    let v: Value = serde_json::from_slice(&body_bytes)?;
    if args.json {
        crate::telegram::internal::pretty(&v)?;
    } else if let Some(link) = v["result"].as_object() {
        println!(
            "Invite link: {}",
            link.get("invite_link")
                .map(|x| x.as_str().unwrap_or(""))
                .unwrap_or("")
        );
    } else {
        println!("Success");
    }
    Ok(())
}
