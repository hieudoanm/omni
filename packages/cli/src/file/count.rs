use super::internal;
use anyhow::Result;
use clap::Args;

#[derive(Args)]
pub struct CountArgs {
    /// File path
    #[arg(long, short = 'f', default_value = "")]
    pub file: String,
}

pub fn run(args: &CountArgs, json: bool) -> Result<()> {
    let data = internal::read_file_bytes(&args.file)?;
    let lines = data.iter().filter(|&&b| b == b'\n').count();
    let text = String::from_utf8_lossy(&data);
    let words = text.split_whitespace().count();
    let bytes = data.len();

    if json {
        println!(
            "{}",
            serde_json::to_string_pretty(&serde_json::json!({
                "file": args.file,
                "lines": lines,
                "words": words,
                "bytes": bytes,
            }))?
        );
    } else {
        println!("{lines:8} {words:8} {bytes:8} {}", args.file);
    }
    Ok(())
}
