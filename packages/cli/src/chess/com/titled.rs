use super::internal as com;
use anyhow::Result;
use clap::Args;

#[derive(Args)]
pub struct TitledArgs {
    /// Output in JSON format
    #[arg(long, short = 'j', global = true)]
    pub json: bool,
}

const TITLES: [&str; 10] = [
    "GM", "IM", "FM", "CM", "NM", "WGM", "WIM", "WFM", "WCM", "WNM",
];

pub fn run(args: &TitledArgs) -> Result<()> {
    if args.json {
        let mut results = serde_json::Map::new();
        for title in TITLES {
            if let Ok(count) = fetch_title_count(title) {
                results.insert(title.to_string(), serde_json::json!(count));
            }
        }
        return com::print_json(&serde_json::json!({ "titles": results }));
    }
    println!();
    println!("| {:<6} | {:>7} |", "Titled", "Players");
    println!("| {} | {} |", "-".repeat(6), "-".repeat(7));
    for title in TITLES {
        match fetch_title_count(title) {
            Ok(count) => println!(
                "| {:<6} | {:>7} |",
                title,
                crate::chess::internal::comma(count)
            ),
            Err(e) => eprintln!("❌ Failed to fetch {title}: {e}"),
        }
    }
    println!();
    Ok(())
}

fn fetch_title_count(title: &str) -> anyhow::Result<i64> {
    let body = com::get(&format!("{}/titled/{}", com::BASE, title))?;
    let resp: serde_json::Value = serde_json::from_slice(&body)?;
    Ok(resp["players"]
        .as_array()
        .map(|a| a.len() as i64)
        .unwrap_or(0))
}
