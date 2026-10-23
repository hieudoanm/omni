use crate::convert::internal::{resolve_text, to_snake_case, write_json};
use anyhow::Result;
use serde::Serialize;

#[derive(clap::Args)]
pub struct Args {
    /// Text to convert
    #[arg()]
    pub text: Option<String>,
}

#[derive(Serialize)]
struct SnakeCaseResult {
    text: String,
    #[serde(rename = "snake_case")]
    snake_case: String,
}

pub fn run(args: &Args, json: bool) -> Result<()> {
    let text = resolve_text(args.text.as_deref())?;
    let snake = to_snake_case(&text);
    if json {
        return write_json(&SnakeCaseResult {
            text,
            snake_case: snake,
        });
    }
    println!("{snake}");
    Ok(())
}
