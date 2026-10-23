use anyhow::{anyhow, Result};
use chrono::Local;
use chrono_tz::Tz;
use clap::Args;
use std::collections::HashMap;

#[derive(Args)]
pub struct WorldArgs {
    /// Timezone aliases (e.g. ny london tokyo)
    #[arg()]
    pub zones: Vec<String>,
}

fn common_zones() -> HashMap<&'static str, &'static str> {
    [
        ("utc", "UTC"),
        ("ny", "America/New_York"),
        ("london", "Europe/London"),
        ("tokyo", "Asia/Tokyo"),
        ("hcmc", "Asia/Ho_Chi_Minh"),
        ("hanoi", "Asia/Ho_Chi_Minh"),
        ("sf", "America/Los_Angeles"),
        ("la", "America/Los_Angeles"),
        ("paris", "Europe/Paris"),
        ("berlin", "Europe/Berlin"),
        ("mumbai", "Asia/Kolkata"),
        ("beijing", "Asia/Shanghai"),
        ("seoul", "Asia/Seoul"),
        ("sydney", "Australia/Sydney"),
        ("dubai", "Asia/Dubai"),
        ("singapore", "Asia/Singapore"),
        ("hk", "Asia/Hong_Kong"),
        ("ams", "Europe/Amsterdam"),
        ("chi", "America/Chicago"),
        ("den", "America/Denver"),
        ("phx", "America/Phoenix"),
    ]
    .into_iter()
    .collect()
}

fn load_tz(alias: &str) -> Result<Tz> {
    let zones = common_zones();
    let name = zones.get(alias).copied().unwrap_or(alias);
    name.parse::<Tz>()
        .map_err(|_| anyhow!("unknown timezone: {alias}"))
}

pub fn run(args: &WorldArgs) -> Result<()> {
    let now = Local::now();
    if !args.zones.is_empty() {
        for alias in &args.zones {
            let tz = load_tz(alias)?;
            let t = now.with_timezone(&tz);
            println!("{alias}: {}", t.format("%a, %d %b %Y %H:%M:%S %Z"));
        }
        return Ok(());
    }
    for alias in ["utc", "ny", "london", "tokyo", "hcmc"] {
        let tz = load_tz(alias)?;
        let t = now.with_timezone(&tz);
        println!("{alias}: {}", t.format("%a, %d %b %Y %H:%M:%S %Z"));
    }
    Ok(())
}
