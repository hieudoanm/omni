use crate::convert::internal::{capitalise, resolve_text, write_json};
use anyhow::Result;
use serde::Serialize;

#[derive(clap::Args)]
pub struct Args {
    /// Text to convert
    #[arg()]
    pub text: Option<String>,
}

#[derive(Serialize)]
struct CapitaliseResult {
    text: String,
    capitalise: String,
}

pub fn run(args: &Args, json: bool) -> Result<()> {
    let text = resolve_text(args.text.as_deref())?;
    let capitalised = capitalise(&text);
    if json {
        return write_json(&CapitaliseResult {
            text,
            capitalise: capitalised,
        });
    }
    println!("{capitalised}");
    Ok(())
}
