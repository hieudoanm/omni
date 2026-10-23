use super::internal as com;
use anyhow::{anyhow, Result};
use clap::Args;

#[derive(Args)]
pub struct LeaderboardsArgs {
    /// Number of top players to display
    #[arg(long, default_value_t = 5)]
    pub top: i64,
    /// Filter players by country code (e.g., US, RU)
    #[arg(long, default_value = "")]
    pub country: String,
    /// Output in JSON format
    #[arg(long, short = 'j', global = true)]
    pub json: bool,
}

pub fn run(args: &LeaderboardsArgs) -> Result<()> {
    let mut top = args.top;
    if top <= 0 {
        top = 5;
    }
    let body = com::get(&format!("{}/leaderboards", com::BASE))
        .map_err(|e| anyhow!("failed to fetch leaderboards: {e}"))?;
    let data: serde_json::Value =
        serde_json::from_slice(&body).map_err(|e| anyhow!("failed to parse response: {e}"))?;
    let filter = |players: &serde_json::Value| -> Vec<serde_json::Value> {
        if args.country.is_empty() {
            return players.as_array().cloned().unwrap_or_default();
        }
        players
            .as_array()
            .map(|arr| {
                arr.iter()
                    .filter(|p| {
                        let (code, _) = com::country_from_url(&com::s(&p["country"]));
                        code == args.country.to_uppercase()
                    })
                    .cloned()
                    .collect()
            })
            .unwrap_or_default()
    };
    if args.json {
        let out = serde_json::json!({
            "bullet": filter(&data["live_bullet"]),
            "blitz": filter(&data["live_blitz"]),
            "rapid": filter(&data["live_rapid"]),
            "blitz960": filter(&data["live_blitz960"]),
        });
        return com::print_json(&out);
    }
    print_top("♟ Live Bullet", &filter(&data["live_bullet"]), top);
    print_top("♞ Live Blitz", &filter(&data["live_blitz"]), top);
    print_top("⏱ Live Rapid", &filter(&data["live_rapid"]), top);
    print_top("♜ Live Blitz 960", &filter(&data["live_blitz960"]), top);
    Ok(())
}

fn print_top(title: &str, players: &[serde_json::Value], limit: i64) {
    if players.is_empty() {
        return;
    }
    println!("\n{title}\n");
    println!(
        "| {:<4} | {:<32} | {:<24} | {:<24} | {:<6} | {:<24} |",
        "Rank", "Name", "Username", "Country", "Score", "W / D / L"
    );
    println!(
        "| {} | {} | {} | {} | {} | {} |",
        "-".repeat(4),
        "-".repeat(32),
        "-".repeat(24),
        "-".repeat(24),
        "-".repeat(6),
        "-".repeat(24)
    );
    let n = (players.len() as i64).min(limit) as usize;
    for p in &players[..n] {
        let name = com::s(&p["name"]);
        let name = if name.is_empty() { "-".into() } else { name };
        let (_, country_name) = com::country_from_url(&com::s(&p["country"]));
        println!(
            "| {:<4} | {:<32} | {:<24} | {:<24} | {:<6} | {:<24} |",
            com::i(&p["rank"]),
            name,
            com::s(&p["username"]).to_lowercase(),
            country_name,
            com::i(&p["score"]),
            format!(
                "{} / {} / {}",
                com::i(&p["win_count"]),
                com::i(&p["draw_count"]),
                com::i(&p["loss_count"])
            )
        );
    }
}
