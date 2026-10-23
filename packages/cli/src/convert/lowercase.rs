use crate::convert::internal::{resolve_text, write_json};
use anyhow::Result;
use serde::Serialize;

#[derive(clap::Args)]
pub struct Args {
    /// Text to convert
    #[arg()]
    pub text: Option<String>,
}

#[derive(Serialize)]
struct LowercaseResult {
    text: String,
    lowercase: String,
}

pub fn run(args: &Args, json: bool) -> Result<()> {
    let text = resolve_text(args.text.as_deref())?;
    let lower = text.to_lowercase();
    if json {
        return write_json(&LowercaseResult {
            text,
            lowercase: lower,
        });
    }
    println!("{lower}");
    Ok(())
}
