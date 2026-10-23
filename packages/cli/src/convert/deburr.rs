use crate::convert::internal::{deburr, resolve_text, write_json};
use anyhow::Result;
use serde::Serialize;

#[derive(clap::Args)]
pub struct Args {
    /// Text to convert
    #[arg()]
    pub text: Option<String>,
}

#[derive(Serialize)]
struct DeburrResult {
    text: String,
    deburr: String,
}

pub fn run(args: &Args, json: bool) -> Result<()> {
    let text = resolve_text(args.text.as_deref())?;
    let deburred = deburr(&text);
    if json {
        return write_json(&DeburrResult {
            text,
            deburr: deburred,
        });
    }
    println!("{deburred}");
    Ok(())
}
