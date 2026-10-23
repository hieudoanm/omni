use super::super::internal;
use anyhow::{anyhow, Result};
use clap::Args;
use serde_json::json;

#[derive(Args)]
pub struct CsvArgs {
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

pub fn run(args: &CsvArgs) -> Result<()> {
    if args.url.is_empty() {
        return Err(anyhow!("url is required"));
    }
    if !std::path::Path::new(&args.out).is_dir() {
        return Err(anyhow!("directory {} does not exist", args.out));
    }
    let html = internal::fetch_page(&args.url)?;
    let tables = internal::parse_tables(&html);
    if tables.is_empty() {
        if args.json {
            println!(
                "{}",
                serde_json::to_string_pretty(
                    &json!({"url": args.url, "files": Vec::<String>::new()})
                )?
            );
        } else {
            println!("no tables found");
        }
        return Ok(());
    }
    let paths = internal::tables_to_csv_files(&tables, &args.url, &args.out)?;
    if args.json {
        println!(
            "{}",
            serde_json::to_string_pretty(&json!({"url": args.url, "files": paths}))?
        );
    } else {
        for p in &paths {
            println!("{p}");
        }
    }
    Ok(())
}
