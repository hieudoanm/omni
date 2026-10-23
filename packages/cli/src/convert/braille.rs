use crate::convert::internal::{resolve_text, to_braille, write_json};
use anyhow::Result;
use serde::Serialize;

#[derive(clap::Args)]
pub struct Args {
    /// Text to convert
    #[arg()]
    pub text: Option<String>,
}

#[derive(Serialize)]
struct BrailleResult {
    text: String,
    braille: String,
}

pub fn run(args: &Args, json: bool) -> Result<()> {
    let text = resolve_text(args.text.as_deref())?;
    let braille = to_braille(&text);
    if json {
        return write_json(&BrailleResult { text, braille });
    }
    println!("{braille}");
    Ok(())
}
