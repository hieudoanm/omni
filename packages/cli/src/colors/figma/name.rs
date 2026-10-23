use super::internal;
use anyhow::Result;
use clap::Args;

#[derive(Args)]
pub struct NameArgs {
    /// Palette name to look up
    #[arg(long, short = 'n', default_value = "")]
    pub name: String,
    /// Optional positional query (Go FlagOrArg: flag wins, else first arg)
    #[arg()]
    pub query: Option<String>,
}

fn query(args: &NameArgs) -> String {
    if !args.name.is_empty() {
        args.name.trim().to_string()
    } else {
        args.query.clone().unwrap_or_default().trim().to_string()
    }
}

pub fn run(args: &NameArgs, json: bool) -> Result<()> {
    let q = query(args);
    if q.is_empty() {
        anyhow::bail!("--name flag is required");
    }
    for (pn, colors) in internal::palettes() {
        if pn.eq_ignore_ascii_case(&q) {
            if json {
                let out: Vec<serde_json::Value> = colors
                    .iter()
                    .map(|c| serde_json::json!({"name": c.name, "hex": c.hex}))
                    .collect();
                println!(
                    "{}",
                    serde_json::to_string_pretty(&serde_json::json!({
                        "palette": pn,
                        "colors": out,
                    }))?
                );
            } else {
                println!("Palette: {pn}");
                for c in colors.iter() {
                    println!("  {} {}", c.hex, c.name);
                }
            }
            return Ok(());
        }
    }

    if let Some(hex) = internal::lookup(&q) {
        let exact = internal::find_exact_name(&q);
        if json {
            println!(
                "{}",
                serde_json::to_string_pretty(&serde_json::json!({
                    "name": exact,
                    "hex": hex,
                }))?
            );
        } else {
            println!("{hex} {exact}");
        }
        return Ok(());
    }

    let ql = q.to_lowercase();
    let suggestions: Vec<String> = internal::palette_names()
        .iter()
        .filter(|n| n.to_lowercase().contains(&ql))
        .map(|s| s.to_string())
        .collect();
    if !suggestions.is_empty() {
        if json {
            println!(
                "{}",
                serde_json::to_string_pretty(&serde_json::json!({
                    "error": format!("palette {q:?} not found"),
                    "similar": suggestions,
                }))?
            );
        } else {
            println!("Palette {q:?} not found. Did you mean?");
            for s in suggestions {
                println!("  {s}");
            }
        }
        return Ok(());
    }

    if json {
        println!(
            "{}",
            serde_json::to_string_pretty(&serde_json::json!({
                "error": format!("palette {q:?} not found"),
            }))?
        );
    } else {
        anyhow::bail!("palette {q:?} not found");
    }
    Ok(())
}
