use anyhow::Result;
use clap::Args;
use serde::Serialize;
use std::env;

#[derive(Args)]
pub struct EnvArgs {
    /// Filter by key prefix
    #[arg()]
    pub key: Option<String>,
    /// Sort alphabetically by key
    #[arg(long)]
    pub sort: bool,
}

#[derive(Serialize)]
struct Entry {
    key: String,
    value: String,
}

pub fn run(args: &EnvArgs, json: bool) -> Result<()> {
    let filter = args.key.clone().unwrap_or_default();
    let mut entries: Vec<Entry> = env::vars()
        .filter(|(k, _)| filter.is_empty() || k.starts_with(&filter))
        .map(|(k, v)| Entry { key: k, value: v })
        .collect();

    if args.sort {
        entries.sort_by(|a, b| a.key.cmp(&b.key));
    }

    if json {
        println!("{}", serde_json::to_string_pretty(&entries)?);
    } else {
        for e in &entries {
            println!("{}={}", e.key, e.value);
        }
    }
    Ok(())
}
