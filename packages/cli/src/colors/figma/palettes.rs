use super::internal;
use anyhow::Result;
use clap::Args;

#[derive(Args)]
pub struct PalettesArgs {}

pub fn run(_args: &PalettesArgs, json: bool) -> Result<()> {
    let names = internal::palette_names();
    if json {
        let mut map = serde_json::Map::new();
        for pn in names {
            if let Some((_, colors)) = internal::palettes().iter().find(|(n, _)| *n == *pn) {
                let arr: Vec<serde_json::Value> = colors
                    .iter()
                    .map(|c| serde_json::json!({"name": c.name, "hex": c.hex}))
                    .collect();
                map.insert(pn.to_string(), serde_json::Value::Array(arr));
            }
        }
        println!(
            "{}",
            serde_json::to_string(&serde_json::Value::Object(map))?
        );
    } else {
        let mut sorted: Vec<&str> = names.to_vec();
        sorted.sort();
        for pn in sorted {
            if let Some((_, colors)) = internal::palettes().iter().find(|(n, _)| *n == pn) {
                let mut cols: Vec<_> = colors.to_vec();
                cols.sort_by(|a, b| a.name.cmp(b.name));
                println!("=== {pn} ===");
                for c in cols {
                    println!("  {}  {}", c.hex, c.name);
                }
                println!();
            }
        }
    }
    Ok(())
}
