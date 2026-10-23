use anyhow::Result;
use serde_json::{json, Map, Value};

#[derive(clap::Args)]
pub struct Args {
    /// JSON array of command objects
    #[arg(long = "commands", default_value = "")]
    pub commands: String,
    /// JSON object with command scope
    #[arg(long = "scope", default_value = "")]
    pub scope: String,
    /// Language code (e.g. en)
    #[arg(long = "language-code", default_value = "")]
    pub language_code: String,
    /// Telegram Bot API token (or TELEGRAM_BOT_TOKEN)
    #[arg(long, short = 't', global = true, default_value = "")]
    pub token: String,
    /// Output in JSON format
    #[arg(long, short = 'j', global = true, default_value_t = false)]
    pub json: bool,
}

pub fn run(args: &Args) -> Result<()> {
    let token = crate::telegram::internal::resolve_token(&args.token)?;
    if args.commands.is_empty() {
        anyhow::bail!("--commands is required (JSON array)");
    }
    let mut body = Map::new();
    let commands: Value = serde_json::from_str(&args.commands)
        .map_err(|e| anyhow::anyhow!("invalid --commands JSON: {e}"))?;
    body.insert("commands".into(), commands.clone());
    if !args.language_code.is_empty() {
        body.insert("language_code".into(), json!(args.language_code));
    }
    if !args.scope.is_empty() {
        let scope_obj: Value = serde_json::from_str(&args.scope)
            .map_err(|e| anyhow::anyhow!("invalid --scope JSON: {e}"))?;
        body.insert("scope".into(), scope_obj);
    }
    crate::telegram::internal::call_post(&token, "setMyCommands", Value::Object(body), args.json)?;
    Ok(())
}
