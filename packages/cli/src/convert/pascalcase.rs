use crate::convert::internal::{resolve_text, to_pascal_case, write_json};
use anyhow::Result;
use serde::Serialize;

#[derive(clap::Args)]
pub struct Args {
    /// Text to convert
    #[arg()]
    pub text: Option<String>,
}

#[derive(Serialize)]
struct PascalCaseResult {
    text: String,
    #[serde(rename = "PascalCase")]
    pascal_case: String,
}

pub fn run(args: &Args, json: bool) -> Result<()> {
    let text = resolve_text(args.text.as_deref())?;
    let pascal = to_pascal_case(&text);
    if json {
        return write_json(&PascalCaseResult {
            text,
            pascal_case: pascal,
        });
    }
    println!("{pascal}");
    Ok(())
}
