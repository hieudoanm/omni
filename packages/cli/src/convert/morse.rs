use crate::convert::internal::{resolve_text, to_morse, write_json};
use anyhow::Result;
use serde::Serialize;

#[derive(clap::Args)]
pub struct Args {
    /// Text to convert
    #[arg()]
    pub text: Option<String>,
}

#[derive(Serialize)]
struct MorseResult {
    text: String,
    morse: String,
}

pub fn run(args: &Args, json: bool) -> Result<()> {
    let text = resolve_text(args.text.as_deref())?;
    let morse = to_morse(&text);
    if json {
        return write_json(&MorseResult { text, morse });
    }
    println!("{morse}");
    Ok(())
}
