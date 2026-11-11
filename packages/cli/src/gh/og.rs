use super::shared;
use anyhow::{anyhow, Result};
use clap::Args;
use serde::{Deserialize, Deserializer};

fn de_str<'de, D: Deserializer<'de>>(d: D) -> Result<String, D::Error> {
    Ok(Option::<String>::deserialize(d)?.unwrap_or_default())
}

#[derive(Args)]
pub struct OgArgs {
    /// Repository (owner/repo)
    #[arg(long, short = 'u', default_value = "")]
    pub url: String,
    /// Output SVG file path
    #[arg(long, short = 'o', default_value = "og.svg")]
    pub output: String,
}

#[derive(Deserialize)]
struct GhRepo {
    #[serde(deserialize_with = "de_str")]
    name: String,
    #[serde(deserialize_with = "de_str")]
    full_name: String,
    #[serde(default, deserialize_with = "de_str")]
    description: String,
    #[serde(deserialize_with = "de_str")]
    html_url: String,
    #[serde(default)]
    stargazers_count: i64,
    #[serde(default)]
    forks_count: i64,
    #[serde(default, deserialize_with = "de_str")]
    language: String,
    owner: Owner,
}

#[derive(Deserialize)]
struct Owner {
    #[serde(deserialize_with = "de_str")]
    login: String,
    #[serde(default, deserialize_with = "de_str")]
    avatar_url: String,
}

fn fetch_repo(repo_arg: &str) -> Result<GhRepo> {
    let parts: Vec<&str> = repo_arg.split('/').collect();
    if parts.len() != 2 {
        anyhow::bail!("repo must be in format owner/repo (got {repo_arg:?})");
    }
    let url = format!("https://api.github.com/repos/{}/{}", parts[0], parts[1]);
    let body = shared::fetch(&url).map_err(|e| anyhow!("error fetching repository: {e}"))?;
    serde_json::from_slice(&body).map_err(|e| anyhow!("error parsing response: {e}"))
}

fn escape_xml(s: &str) -> String {
    s.replace('&', "&amp;")
        .replace('<', "&lt;")
        .replace('>', "&gt;")
        .replace('\'', "&apos;")
        .replace('"', "&quot;")
}

fn generate_svg(repo: &GhRepo) -> String {
    let (width, height) = (1200, 630);
    let mut desc = repo.description.clone();
    if desc.chars().count() > 120 {
        desc = format!("{}...", desc.chars().take(120).collect::<String>());
    }
    if desc.is_empty() {
        desc = "No description".to_string();
    }
    let lang_color = shared::language_color(&repo.language);

    let mut sb = String::new();
    sb.push_str(&format!(
        "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"{width}\" height=\"{height}\" viewBox=\"0 0 {width} {height}\">\n<defs>\n  <linearGradient id=\"bg\" x1=\"0%\" y1=\"0%\" x2=\"100%\" y2=\"100%\">\n    <stop offset=\"0%\" stop-color=\"#0d1117\"/>\n    <stop offset=\"100%\" stop-color=\"#161b22\"/>\n  </linearGradient>\n</defs>\n<rect width=\"{width}\" height=\"{height}\" fill=\"url(#bg)\" rx=\"12\"/>\n"
    ));
    if !repo.owner.avatar_url.is_empty() {
        sb.push_str(&format!(
            "<image x=\"60\" y=\"60\" width=\"80\" height=\"80\" href=\"{}\" rx=\"40\"/>\n",
            repo.owner.avatar_url
        ));
    }
    sb.push_str(&format!(
        "<text x=\"155\" y=\"95\" fill=\"#8b949e\" font-family=\"sans-serif\" font-size=\"18\">{}</text>\n",
        escape_xml(&repo.owner.login)
    ));
    sb.push_str(&format!(
        "<text x=\"60\" y=\"145\" fill=\"#58a6ff\" font-family=\"sans-serif\" font-size=\"36\" font-weight=\"bold\">{}</text>\n",
        escape_xml(&repo.name)
    ));
    sb.push_str(&format!(
        "<text x=\"60\" y=\"195\" fill=\"#c9d1d9\" font-family=\"sans-serif\" font-size=\"20\">{}</text>\n",
        escape_xml(&desc)
    ));
    let stat_y = 270;
    sb.push_str(&format!(
        "<circle cx=\"65\" cy=\"{}\" r=\"8\" fill=\"{lang_color}\"/>\n",
        stat_y - 6
    ));
    sb.push_str(&format!(
        "<text x=\"82\" y=\"{stat_y}\" fill=\"#8b949e\" font-family=\"sans-serif\" font-size=\"18\">{}</text>\n",
        escape_xml(&repo.language)
    ));
    sb.push_str(&format!(
        "<text x=\"200\" y=\"{stat_y}\" fill=\"#8b949e\" font-family=\"sans-serif\" font-size=\"18\">★ {}</text>\n",
        repo.stargazers_count
    ));
    sb.push_str(&format!(
        "<text x=\"320\" y=\"{stat_y}\" fill=\"#8b949e\" font-family=\"sans-serif\" font-size=\"18\">⑂ {}</text>\n",
        repo.forks_count
    ));
    sb.push_str(&format!(
        "<text x=\"60\" y=\"{}\" fill=\"#30363d\" font-family=\"sans-serif\" font-size=\"16\">{}</text>\n",
        height - 30,
        escape_xml(&repo.html_url)
    ));
    sb.push_str("</svg>\n");
    sb
}

pub fn run(args: &OgArgs, json: bool) -> Result<()> {
    if json {
        let repo = fetch_repo(&args.url)?;
        println!(
            "{}",
            serde_json::to_string_pretty(&serde_json::json!({
                "title": repo.full_name,
                "description": repo.description,
                "image": repo.owner.avatar_url,
            }))?
        );
        return Ok(());
    }
    let repo = fetch_repo(&args.url)?;
    std::fs::write(&args.output, generate_svg(&repo))
        .map_err(|e| anyhow!("error writing SVG: {e}"))?;
    println!("✓ {} generated at {}", args.output, args.output);
    Ok(())
}
