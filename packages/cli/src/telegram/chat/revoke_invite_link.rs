use anyhow::Result;
use serde_json::{json, Map, Value};

#[derive(clap::Args)]
pub struct Args {
    /// Target chat ID or @username
    #[arg(long = "chat-id", default_value = "")]
    pub chat_id: String,
    /// The invite link to revoke
    #[arg(long = "invite-link", default_value = "")]
    pub invite_link: String,
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
    if args.invite_link.is_empty() {
        anyhow::bail!("--invite-link is required");
    }
    let mut body = Map::new();
    body.insert("chat_id".into(), json!(args.chat_id));
    body.insert("invite_link".into(), json!(args.invite_link));
    let body_bytes = crate::telegram::internal::call_post_raw(
        &token,
        "revokeChatInviteLink",
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
