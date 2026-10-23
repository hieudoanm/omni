use super::{days_in_month, print_json};
use anyhow::{anyhow, Result};
use chrono::{Datelike, Local, NaiveDate};
use clap::Args;
use serde_json::json;

#[derive(Args)]
pub struct AgeArgs {
    /// Birth year
    #[arg(long, short = 'y', default_value_t = 0)]
    pub year: i64,
    /// Birth month (1-12)
    #[arg(long, short = 'm', default_value_t = 0)]
    pub month: i64,
    /// Birth day (1-31)
    #[arg(long, short = 'd', default_value_t = 0)]
    pub day: i64,
}

fn calc_age(birth: NaiveDate, today: NaiveDate) -> (i64, i64, i64) {
    let (mut ty, mut tm, mut td) = (
        today.year() as i64,
        today.month() as i64,
        today.day() as i64,
    );
    let birth_day = birth.day() as i64;
    let birth_month = birth.month() as i64;
    let birth_year = birth.year() as i64;

    if td < birth_day {
        tm -= 1;
        td += days_in_month(ty as i32, tm as i32);
    }
    if tm < birth_month {
        ty -= 1;
        tm += 12;
    }
    (ty - birth_year, tm - birth_month, td - birth_day)
}

pub fn run(args: &AgeArgs, json: bool) -> Result<()> {
    let (year, month, day) = (args.year, args.month, args.day);
    if year == 0 || month == 0 || day == 0 {
        return Err(anyhow!("birth year, month, and day are required"));
    }
    if !(1..=12).contains(&month) {
        return Err(anyhow!("month must be between 1 and 12"));
    }
    if !(1..=31).contains(&day) {
        return Err(anyhow!("day must be between 1 and 31"));
    }
    let Some(birth) = NaiveDate::from_ymd_opt(year as i32, month as u32, day as u32) else {
        return Err(anyhow!(
            "invalid birth date: {year:04}/{month:02}/{day:02} does not exist"
        ));
    };
    let today = Local::now().date_naive();
    if birth > today {
        return Err(anyhow!("birth date cannot be in the future"));
    }
    let (y, m, d) = calc_age(birth, today);
    if json {
        return print_json(&json!({
            "birth_date": birth.format("%Y-%m-%d").to_string(),
            "years": y, "months": m, "days": d,
        }));
    }
    println!("Age: {y} years, {m} months, {d} days");
    Ok(())
}
