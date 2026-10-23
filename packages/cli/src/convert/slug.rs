use crate::convert::internal::{resolve_text, slug, write_json};
use anyhow::Result;
use serde::Serialize;

#[derive(clap::Args)]
pub struct Args {
    /// Text to convert
    #[arg()]
    pub text: Option<String>,
}

#[derive(Serialize)]
struct SlugResult {
    text: String,
    slug: String,
}

pub fn run(args: &Args, json: bool) -> Result<()> {
    let text = resolve_text(args.text.as_deref())?;
    let slug = slug(&text);
    if json {
        return write_json(&SlugResult { text, slug });
    }
    println!("{slug}");
    Ok(())
}
