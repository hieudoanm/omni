use crate::convert::internal::{resolve_text, to_kebab_case, write_json};
use anyhow::Result;
use serde::Serialize;

#[derive(clap::Args)]
pub struct Args {
    /// Text to convert
    #[arg()]
    pub text: Option<String>,
}

#[derive(Serialize)]
struct KebabCaseResult {
    text: String,
    #[serde(rename = "kebab-case")]
    kebab_case: String,
}

pub fn run(args: &Args, json: bool) -> Result<()> {
    let text = resolve_text(args.text.as_deref())?;
    let kebab = to_kebab_case(&text);
    if json {
        return write_json(&KebabCaseResult {
            text,
            kebab_case: kebab,
        });
    }
    println!("{kebab}");
    Ok(())
}
