use crate::convert::internal::{resolve_text, to_camel_case, write_json};
use anyhow::Result;
use serde::Serialize;

#[derive(clap::Args)]
pub struct Args {
    /// Text to convert
    #[arg()]
    pub text: Option<String>,
}

#[derive(Serialize)]
struct CamelCaseResult {
    text: String,
    #[serde(rename = "camelCase")]
    camel_case: String,
}

pub fn run(args: &Args, json: bool) -> Result<()> {
    let text = resolve_text(args.text.as_deref())?;
    let camel = to_camel_case(&text);
    if json {
        return write_json(&CamelCaseResult {
            text,
            camel_case: camel,
        });
    }
    println!("{camel}");
    Ok(())
}
