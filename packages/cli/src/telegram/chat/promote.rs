use anyhow::Result;
use serde_json::{json, Map, Value};

#[derive(clap::Args)]
pub struct Args {
    /// Target chat ID or @username
    #[arg(long = "chat-id", default_value = "")]
    pub chat_id: String,
    /// User ID to promote
    #[arg(long = "user-id", default_value_t = 0)]
    pub user_id: i64,
    /// Admin is anonymous
    #[arg(long = "is-anonymous", default_value_t = false)]
    pub is_anonymous: bool,
    /// Can manage the chat
    #[arg(long = "can-manage-chat", default_value_t = false)]
    pub can_manage_chat: bool,
    /// Can delete messages
    #[arg(long = "can-delete-messages", default_value_t = false)]
    pub can_delete_messages: bool,
    /// Can manage video chats
    #[arg(long = "can-manage-video-chats", default_value_t = false)]
    pub can_manage_video_chats: bool,
    /// Can restrict members
    #[arg(long = "can-restrict-members", default_value_t = false)]
    pub can_restrict_members: bool,
    /// Can promote members
    #[arg(long = "can-promote-members", default_value_t = false)]
    pub can_promote_members: bool,
    /// Can change chat info
    #[arg(long = "can-change-info", default_value_t = false)]
    pub can_change_info: bool,
    /// Can invite users
    #[arg(long = "can-invite-users", default_value_t = false)]
    pub can_invite_users: bool,
    /// Can post stories
    #[arg(long = "can-post-stories", default_value_t = false)]
    pub can_post_stories: bool,
    /// Can edit stories
    #[arg(long = "can-edit-stories", default_value_t = false)]
    pub can_edit_stories: bool,
    /// Can delete stories
    #[arg(long = "can-delete-stories", default_value_t = false)]
    pub can_delete_stories: bool,
    /// Can post messages (channels)
    #[arg(long = "can-post-messages", default_value_t = false)]
    pub can_post_messages: bool,
    /// Can edit messages (channels)
    #[arg(long = "can-edit-messages", default_value_t = false)]
    pub can_edit_messages: bool,
    /// Can pin messages
    #[arg(long = "can-pin-messages", default_value_t = false)]
    pub can_pin_messages: bool,
    /// Can post stories
    #[arg(long = "can-post-story", default_value_t = false)]
    pub can_post_story: bool,
    /// Can manage forum topics
    #[arg(long = "can-manage-topics", default_value_t = false)]
    pub can_manage_topics: bool,
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
    if args.user_id == 0 {
        anyhow::bail!("--user-id is required");
    }
    let mut body = Map::new();
    body.insert("chat_id".into(), json!(args.chat_id));
    body.insert("user_id".into(), json!(args.user_id));
    if args.is_anonymous {
        body.insert("is_anonymous".into(), json!(true));
    }
    if args.can_manage_chat {
        body.insert("can_manage_chat".into(), json!(true));
    }
    if args.can_delete_messages {
        body.insert("can_delete_messages".into(), json!(true));
    }
    if args.can_manage_video_chats {
        body.insert("can_manage_video_chats".into(), json!(true));
    }
    if args.can_restrict_members {
        body.insert("can_restrict_members".into(), json!(true));
    }
    if args.can_promote_members {
        body.insert("can_promote_members".into(), json!(true));
    }
    if args.can_change_info {
        body.insert("can_change_info".into(), json!(true));
    }
    if args.can_invite_users {
        body.insert("can_invite_users".into(), json!(true));
    }
    if args.can_post_stories {
        body.insert("can_post_stories".into(), json!(true));
    }
    if args.can_edit_stories {
        body.insert("can_edit_stories".into(), json!(true));
    }
    if args.can_delete_stories {
        body.insert("can_delete_stories".into(), json!(true));
    }
    if args.can_post_messages {
        body.insert("can_post_messages".into(), json!(true));
    }
    if args.can_edit_messages {
        body.insert("can_edit_messages".into(), json!(true));
    }
    if args.can_pin_messages {
        body.insert("can_pin_messages".into(), json!(true));
    }
    if args.can_post_story {
        body.insert("can_post_story".into(), json!(true));
    }
    if args.can_manage_topics {
        body.insert("can_manage_topics".into(), json!(true));
    }
    crate::telegram::internal::call_post(
        &token,
        "promoteChatMember",
        Value::Object(body),
        args.json,
    )?;
    Ok(())
}
