use anyhow::Result;
use serde_json::Value;

#[derive(clap::Args)]
pub struct Args {
    /// Telegram Bot API token (or TELEGRAM_BOT_TOKEN)
    #[arg(long, short = 't', global = true, default_value = "")]
    pub token: String,
    /// Output in JSON format
    #[arg(long, short = 'j', global = true, default_value_t = false)]
    pub json: bool,
}

pub fn run(args: &Args) -> Result<()> {
    let token = crate::telegram::internal::resolve_token(&args.token)?;
    let body_bytes = crate::telegram::internal::call_post_raw(&token, "getWebhookInfo", None)?;
    let v: Value = serde_json::from_slice(&body_bytes)?;
    if args.json {
        crate::telegram::internal::pretty(&v)?;
    } else if v["ok"].as_bool().unwrap_or(false) {
        if let Some(info) = v["result"].as_object() {
            let g = |k: &str| {
                info.get(k)
                    .map(|x| match x {
                        serde_json::Value::String(s) => s.clone(),
                        other => other.to_string(),
                    })
                    .unwrap_or_default()
            };
            println!("URL: {}", g("url"));
            println!("Pending updates: {}", g("pending_update_count"));
            if let Some(c) = info.get("has_custom_certificate") {
                println!("Custom certificate: {c}");
            }
        } else {
            println!("Success");
        }
    } else {
        println!("Failed");
    }
    Ok(())
}
