use super::print_table;
use anyhow::Result;
use clap::Args;
use serde::Serialize;
use std::env;

#[derive(Args)]
pub struct EnvArgs {
    /// Filter by variable name (substring match)
    #[arg(long, short = 'n', default_value = "")]
    pub name: String,
    /// Sort: key, value
    #[arg(long, short = 's', default_value = "key")]
    pub sort: String,
}

#[derive(Serialize)]
struct EnvEntry {
    key: String,
    value: String,
}

pub fn run(args: &EnvArgs, json: bool) -> Result<()> {
    let mut results: Vec<EnvEntry> = env::vars()
        .filter(|(k, _)| {
            args.name.is_empty() || k.to_lowercase().contains(&args.name.to_lowercase())
        })
        .map(|(k, v)| EnvEntry { key: k, value: v })
        .collect();

    if args.sort == "value" {
        results.sort_by_key(|e| e.value.to_lowercase());
    } else {
        results.sort_by_key(|e| e.key.to_lowercase());
    }

    if json {
        println!(
            "{}",
            serde_json::to_string_pretty(&serde_json::json!({
                "variables": results,
                "count": results.len(),
            }))?
        );
        return Ok(());
    }

    let rows: Vec<Vec<String>> = results
        .iter()
        .map(|e| vec![e.key.clone(), e.value.clone()])
        .collect();
    print_table(&["KEY", "VALUE"], &rows);
    Ok(())
}
