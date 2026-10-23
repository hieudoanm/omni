use anyhow::Result;
use chrono::{DateTime, Utc};
use clap::Args;

#[derive(Args)]
pub struct UntilArgs {
    /// Target date/time (e.g., 2027-01-01)
    #[arg(long, short = 't', required = true)]
    pub time: String,
}

pub fn run(args: &UntilArgs) -> Result<()> {
    let target: DateTime<Utc> = super::internal::parse_datetime(&args.time)
        .map_err(|e| anyhow::anyhow!("invalid time: {e}"))?;
    let now = Utc::now();
    if target < now {
        println!("The specified time has already passed.");
        return Ok(());
    }
    let duration = target - now;
    let total_secs = duration.num_seconds();
    let days = total_secs / 86400;
    let hours = (total_secs % 86400) / 3600;
    let minutes = (total_secs % 3600) / 60;
    let seconds = total_secs % 60;
    println!("{days}d {hours}h {minutes}m {seconds}s");
    Ok(())
}
