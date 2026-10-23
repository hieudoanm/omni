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
struct UppercaseResult {
    text: String,
    uppercase: String,
}

pub fn run(args: &Args, json: bool) -> Result<()> {
    let text = resolve_text(args.text.as_deref())?;
    let upper = text.to_uppercase();
    if json {
        return write_json(&UppercaseResult {
            text,
            uppercase: upper,
        });
    }
    println!("{upper}");
    Ok(())
}
