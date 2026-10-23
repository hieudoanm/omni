use super::lib;
use anyhow::Result;
use clap::Args;
use std::collections::BTreeMap;

#[derive(Args)]
pub struct ModelsArgs {
    /// Filter models by name or ID
    #[arg(long, short = 's', default_value = "")]
    pub search: String,
    /// Output raw JSON
    #[arg(long)]
    pub json: bool,
}

fn format_ctx(n: i64) -> String {
    if n >= 1_000_000 {
        format!("{}M", n / 1_000_000)
    } else if n >= 1_000 {
        format!("{}k", n / 1_000)
    } else {
        n.to_string()
    }
}

pub fn run(args: &ModelsArgs) -> Result<()> {
    eprintln!("\x1b[36mFetching free models from OpenRouter...\x1b[0m");
    let mut models = lib::fetch_free_models()?;
    if !args.search.is_empty() {
        let q = args.search.to_lowercase();
        models.retain(|m| m.id.to_lowercase().contains(&q) || m.name.to_lowercase().contains(&q));
    }
    if models.is_empty() {
        println!("\x1b[33mNo models found.\x1b[0m");
        return Ok(());
    }
    if args.json {
        println!("{}", serde_json::to_string_pretty(&models)?);
        return Ok(());
    }
    let mut grouped: BTreeMap<String, Vec<lib::Model>> = BTreeMap::new();
    for m in models {
        let provider = m.id.split('/').next().unwrap_or("").to_string();
        grouped.entry(provider).or_default().push(m);
    }
    let total: usize = grouped.values().map(|v| v.len()).sum();
    println!(
        "\n\x1b[1m\x1b[32m{} free model(s) on OpenRouter\x1b[0m\n",
        total
    );
    for (provider, ms) in &grouped {
        println!("  \x1b[1m\x1b[36m{provider}\x1b[0m");
        for m in ms {
            let ctx = if m.context_length > 0 {
                format!(" \x1b[2m[{} ctx]\x1b[0m", format_ctx(m.context_length))
            } else {
                String::new()
            };
            println!("    {}{ctx}", m.id);
            if !m.description.is_empty() {
                let desc = if m.description.chars().count() > 72 {
                    format!("{}…", m.description.chars().take(71).collect::<String>())
                } else {
                    m.description.clone()
                };
                println!("      \x1b[2m{desc}\x1b[0m");
            }
        }
        println!();
    }
    println!("  \x1b[2mRun: omni openrouter serve to start a local proxy\x1b[0m");
    Ok(())
}
