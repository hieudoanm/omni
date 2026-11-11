use super::internal::parse_datetime;
use anyhow::{anyhow, Result};
use chrono::{Datelike, Duration, Local, NaiveDate, Utc};
use clap::Args;

#[derive(Args)]
pub struct AgeArgs {
    /// Birthdate (e.g., 1990-01-15)
    #[arg(long, required = true)]
    pub date: String,
}

pub fn run(args: &AgeArgs, json: bool) -> Result<()> {
    let birthdate = parse_datetime(&args.date).map_err(|e| anyhow!("invalid date: {e}"))?;
    let now = Utc::now();
    if birthdate > now {
        return Err(anyhow!("birthdate cannot be in the future"));
    }
    // Go uses local time for age math.
    let now_local = now.with_timezone(&Local);
    let birth_local = birthdate.with_timezone(&Local);

    let mut years = now_local.year() - birth_local.year();
    let mut months = now_local.month() as i64 - birth_local.month() as i64;
    let mut days = now_local.day() as i64 - birth_local.day() as i64;

    if days < 0 {
        months -= 1;
        days += days_in_prev_month(now_local.date_naive()) as i64;
    }
    if months < 0 {
        years -= 1;
        months += 12;
    }

    if json {
        println!(
            "{{\"birthdate\":\"{}\",\"years\":{},\"months\":{},\"days\":{}}}",
            args.date, years, months, days
        );
        return Ok(());
    }
    println!("You are {years} years, {months} months, and {days} days old");
    Ok(())
}

/// Days in the month before `today`'s month (Go: Date(prevMonth.Year,
/// prevMonth.Month+1, 0).Day()).
fn days_in_prev_month(today: NaiveDate) -> u32 {
    let first = NaiveDate::from_ymd_opt(today.year(), today.month(), 1).unwrap();
    (first - Duration::days(1)).day()
}
