use super::super::internal;
use anyhow::{anyhow, Result};
use clap::Args;
use serde_json::json;

#[derive(Args)]
pub struct MdArgs {
    /// URL to fetch
    #[arg(long, short = 'u', default_value = "")]
    pub url: String,
    /// Output directory (default .)
    #[arg(long, short = 'o', default_value = ".")]
    pub out: String,
    /// Output in JSON format
    #[arg(long)]
    pub json: bool,
}

pub fn run(args: &MdArgs) -> Result<()> {
    if args.url.is_empty() {
        return Err(anyhow!("url is required"));
    }
    if !std::path::Path::new(&args.out).is_dir() {
        return Err(anyhow!("directory {} does not exist", args.out));
    }
    let html = internal::fetch_page(&args.url)?;
    let mut source = html.clone();
    let mut title = String::new();
    if let Some((t, readable)) = internal::extract_readable(&html) {
        title = t;
        source = readable;
    }
    let mut markdown = internal::convert_to_markdown(&source)?;
    if !title.is_empty() {
        markdown = format!("# {title}\n\n{markdown}");
    }
    let filename = format!("{}.md", internal::extract_host(&args.url));
    let file_path = format!("{}/{filename}", args.out);
    std::fs::write(&file_path, &markdown)?;
    let abs_path = std::fs::canonicalize(&file_path).unwrap_or_else(|_| file_path.clone().into());
    if args.json {
        println!(
            "{}",
            serde_json::to_string_pretty(&json!({"url": args.url, "file": abs_path}))?
        );
    } else {
        println!("{}", abs_path.display());
    }
    Ok(())
}
