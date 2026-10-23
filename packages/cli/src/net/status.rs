use anyhow::Result;
use clap::Args;
use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;

#[derive(Args)]
pub struct StatusArgs {
    /// Enable debug logging
    #[arg(long, short = 'd')]
    pub debug: bool,
    /// Output in JSON format
    #[arg(long)]
    pub json: bool,
}

#[derive(Serialize, Deserialize)]
struct Page {
    id: String,
    name: String,
    url: String,
    time_zone: String,
    updated_at: String,
}

#[derive(Serialize, Deserialize)]
struct Status {
    indicator: String,
    description: String,
}

#[derive(Serialize, Deserialize)]
struct Response {
    page: Page,
    status: Status,
}

fn services() -> BTreeMap<&'static str, BTreeMap<&'static str, &'static str>> {
    let mut m = BTreeMap::new();
    m.insert(
        "atlassian",
        BTreeMap::from([
            (
                "analytics",
                "https://analytics.status.atlassian.com/api/v2/status.json",
            ),
            (
                "atlas",
                "https://atlas.status.atlassian.com/api/v2/status.json",
            ),
            (
                "compass",
                "https://compass.status.atlassian.com/api/v2/status.json",
            ),
            (
                "confluence",
                "https://confluence.status.atlassian.com/api/v2/status.json",
            ),
            (
                "developer",
                "https://developer.status.atlassian.com/api/v2/status.json",
            ),
            (
                "guard",
                "https://guard.status.atlassian.com/api/v2/status.json",
            ),
            (
                "jira-service-management",
                "https://jira-service-management.status.atlassian.com/api/v2/status.json",
            ),
            (
                "jira-software",
                "https://jira-software.status.atlassian.com/api/v2/status.json",
            ),
            (
                "opsgenie",
                "https://opsgenie.status.atlassian.com/api/v2/status.json",
            ),
            (
                "partners",
                "https://partners.status.atlassian.com/api/v2/status.json",
            ),
            (
                "support",
                "https://support.status.atlassian.com/api/v2/status.json",
            ),
            (
                "trello",
                "https://trello.status.atlassian.com/api/v2/status.json",
            ),
        ]),
    );
    m.insert(
        "crypto",
        BTreeMap::from([
            ("hedera", "https://status.hedera.com/api/v2/status.json"),
            (
                "polygon",
                "https://status.polygon.technology/api/v2/status.json",
            ),
            ("solana", "https://status.solana.com/api/v2/status.json"),
        ]),
    );
    m.insert(
        "serverless",
        BTreeMap::from([
            (
                "cloudflare",
                "https://www.cloudflarestatus.com/api/v2/status.json",
            ),
            ("flyio", "https://status.flyio.net/api/v2/status.json"),
            (
                "netlify",
                "https://www.netlifystatus.com/api/v2/status.json",
            ),
            ("render", "https://status.render.com/api/v2/status.json"),
            ("supabase", "https://status.supabase.com/api/v2/status.json"),
            ("vercel", "https://www.vercel-status.com/api/v2/status.json"),
        ]),
    );
    m.insert(
        "saas",
        BTreeMap::from([
            (
                "bitbucket",
                "https://bitbucket.status.atlassian.com/api/v2/status.json",
            ),
            ("github", "https://www.githubstatus.com/api/v2/status.json"),
            ("npm", "https://status.npmjs.org/api/v2/status.json"),
            ("canva", "https://www.canvastatus.com/api/v2/status.json"),
            ("figma", "https://status.figma.com/api/v2/status.json"),
        ]),
    );
    m
}

fn descriptive_status(url: &str, debug: bool) -> String {
    let _ = debug;
    match crate::requests::get(url) {
        Ok(body) => match serde_json::from_slice::<Response>(&body) {
            Ok(resp) => {
                if resp.status.indicator == "none" {
                    "Healthy".to_string()
                } else {
                    "Offline".to_string()
                }
            }
            Err(e) => format!("Error: {e}"),
        },
        Err(e) => format!("Error: {e}"),
    }
}

fn tty_color(code: &str, s: &str) -> String {
    use std::io::IsTerminal;
    if std::io::stdout().is_terminal() {
        format!("\x1b[{code}m{s}\x1b[0m")
    } else {
        s.to_string()
    }
}

pub fn run(args: &StatusArgs) -> Result<()> {
    let mut results: Vec<(String, String)> = Vec::new();
    for group in services().values() {
        for (name, url) in group {
            results.push((name.to_string(), descriptive_status(url, args.debug)));
        }
    }

    if args.json {
        let out: Vec<serde_json::Value> = results
            .iter()
            .map(|(n, s)| serde_json::json!({"Name": n, "Status": s}))
            .collect();
        println!("{}", serde_json::to_string_pretty(&out)?);
        return Ok(());
    }

    let max_name = results.iter().map(|(n, _)| n.len()).max().unwrap_or(0);
    for (name, status) in &results {
        let lower = status.to_lowercase();
        let (glyph, colored) =
            if lower.contains("healthy") || lower.contains("up") || lower.contains("ok") {
                ("●", tty_color("32", status))
            } else if lower.contains("down") || lower.contains("error") || lower.contains("fail") {
                ("●", tty_color("31", status))
            } else {
                ("●", tty_color("33", status))
            };
        println!(
            "  {}  {:<width$}  {}",
            glyph,
            name,
            colored,
            width = max_name
        );
    }
    println!("\n  {} services checked", results.len());
    Ok(())
}
