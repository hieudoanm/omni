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
    let body = crate::telegram::internal::call_get_raw(&token, "getMe")?;
    let v: Value = serde_json::from_slice(&body)?;
    if args.json {
        crate::telegram::internal::pretty(&v)?;
    } else if let Some(info) = v["result"].as_object() {
        println!(
            "ID: {}",
            info.get("id").map(|x| x.to_string()).unwrap_or_default()
        );
        println!(
            "Username: @{}",
            info.get("username")
                .map(|x| x.as_str().unwrap_or(""))
                .unwrap_or("")
        );
        println!(
            "First name: {}",
            info.get("first_name")
                .map(|x| x.as_str().unwrap_or(""))
                .unwrap_or("")
        );
        if let Some(b) = info.get("is_bot") {
            println!("Is bot: {b}");
        }
    } else {
        println!("Success");
    }
    Ok(())
}
