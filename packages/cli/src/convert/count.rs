use crate::convert::internal::{read_stdin, write_json};
use anyhow::Result;
use serde::Serialize;

#[derive(clap::Args)]
pub struct Args {
    /// Text to count (reads stdin if omitted)
    #[arg()]
    pub text: Option<String>,
}

#[derive(Serialize)]
struct CountResult {
    characters: usize,
    words: usize,
    lines: usize,
}

pub fn run(args: &Args, json: bool) -> Result<()> {
    let input = match &args.text {
        Some(t) => t.clone(),
        None => read_stdin()?,
    };

    let characters = input.chars().count();
    let words = input.split_whitespace().count();
    let lines = if input.is_empty() {
        0
    } else {
        input.matches('\n').count() + 1
    };

    if json {
        return write_json(&CountResult {
            characters,
            words,
            lines,
        });
    }
    println!("{lines:8} {words:8} {characters:8}");
    Ok(())
}
