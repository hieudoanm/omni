use super::shared;
use anyhow::{anyhow, Result};
use clap::Args;
use serde_json::Value;
use std::collections::BTreeMap;

#[derive(Args)]
pub struct LanguagesArgs {
    /// Repository (owner/repo)
    #[arg(long, short = 'r', default_value = "")]
    pub repo: String,
    /// Output SVG file path
    #[arg(long, short = 'o', default_value = "languages.svg")]
    pub output: String,
}

fn fetch_langs(repo: &str) -> Result<BTreeMap<String, i64>> {
    let parts: Vec<&str> = repo.split('/').collect();
    if parts.len() != 2 {
        anyhow::bail!("repo must be in format owner/repo (got {repo:?})");
    }
    let url = format!("https://api.github.com/repos/{}/languages", parts.join("/"));
    let body = shared::fetch(&url).map_err(|e| anyhow!("error fetching languages: {e}"))?;
    let v: Value =
        serde_json::from_slice(&body).map_err(|e| anyhow!("error parsing response: {e}"))?;
    let mut out = BTreeMap::new();
    if let Some(obj) = v.as_object() {
        for (k, val) in obj {
            out.insert(k.clone(), val.as_i64().unwrap_or(0));
        }
    }
    Ok(out)
}

fn generate_svg(langs: &BTreeMap<String, i64>) -> String {
    let mut entries: Vec<(&String, &i64)> = langs.iter().collect();
    entries.sort_by(|a, b| b.1.cmp(a.1));
    let total: i64 = entries.iter().map(|(_, b)| **b).sum();

    let bar_height = 24;
    let gap = 4;
    let bar_width = 400;
    let height = entries.len() * (bar_height + gap) + 40;

    let mut sb = String::new();
    sb.push_str(&format!(
        "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"{}\" height=\"{}\" viewBox=\"0 0 {} {}\">\n",
        bar_width + 20,
        height,
        bar_width + 20,
        height
    ));
    sb.push_str(&format!(
        "<rect width=\"{}\" height=\"{}\" fill=\"#0d1117\" rx=\"6\"/>\n",
        bar_width + 20,
        height
    ));
    sb.push_str(&format!(
        "<text x=\"{}\" y=\"20\" fill=\"#c9d1d9\" font-family=\"sans-serif\" font-size=\"13\" font-weight=\"600\">Languages</text>\n",
        10
    ));

    let mut y = 35;
    for (name, bytes) in entries {
        let pct = *bytes as f64 / total as f64 * 100.0;
        let mut w = (bar_width as f64 * pct / 100.0) as i32;
        if w < 1 && pct > 0.0 {
            w = 1;
        }
        let color = shared::language_color(name);
        sb.push_str(&format!(
            "<rect x=\"10\" y=\"{y}\" width=\"{w}\" height=\"{bar_height}\" fill=\"{color}\" rx=\"3\"/>\n"
        ));
        sb.push_str(&format!(
            "<text x=\"{}\" y=\"{}\" fill=\"#8b949e\" font-family=\"sans-serif\" font-size=\"11\">{name}</text>\n",
            15,
            y + 16
        ));
        sb.push_str(&format!(
            "<text x=\"{}\" y=\"{}\" fill=\"#8b949e\" font-family=\"sans-serif\" font-size=\"11\" text-anchor=\"end\">{pct:.1}%</text>\n",
            bar_width + 15,
            y + 16
        ));
        y += bar_height + gap;
    }
    sb.push_str("</svg>\n");
    sb
}

pub fn run(args: &LanguagesArgs, json: bool) -> Result<()> {
    if json {
        let langs = fetch_langs(&args.repo)?;
        println!(
            "{}",
            serde_json::to_string_pretty(&serde_json::json!({"languages": langs}))?
        );
        return Ok(());
    }
    let langs = fetch_langs(&args.repo)?;
    if langs.is_empty() {
        println!("No languages found");
        return Ok(());
    }
    println!("Languages:");
    for (lang, bytes) in &langs {
        println!("  {lang}: {bytes} bytes");
    }
    std::fs::write(&args.output, generate_svg(&langs))
        .map_err(|e| anyhow!("error writing SVG: {e}"))?;
    println!("✓ {} generated at {}", args.output, args.output);
    Ok(())
}
