use super::{add_date_component, print_json, weekday_name};
use anyhow::{anyhow, Result};
use chrono::{Local, NaiveDate, NaiveDateTime, NaiveTime, TimeZone};
use clap::Args;
use serde_json::json;

#[derive(Args)]
pub struct DateArgs {
    /// Add N days
    #[arg(long, default_value_t = 0)]
    pub add: i64,
    /// Add N months
    #[arg(long, default_value_t = 0)]
    pub add_months: i64,
    /// Add N years
    #[arg(long, default_value_t = 0)]
    pub add_years: i64,
    /// Calculate days between two dates (YYYY-MM-DD)
    #[arg(long, default_value = "")]
    pub diff: String,
    /// Output format (uses Go time layout)
    #[arg(long, default_value = "")]
    pub format: String,
    /// Date arguments (YYYY-MM-DD)
    #[arg()]
    pub dates: Vec<String>,
}

/// A point in time mirroring Go's time.Time: parsed dates are UTC midnight,
/// `time.Now()` keeps local wall-clock time.
#[derive(Clone, Copy)]
struct DateVal {
    dt: NaiveDateTime,
    utc: bool,
}

impl DateVal {
    fn unix(&self) -> i64 {
        if self.utc {
            self.dt.and_utc().timestamp()
        } else {
            Local
                .from_local_datetime(&self.dt)
                .single()
                .map(|d| d.timestamp())
                .unwrap_or_else(|| self.dt.and_utc().timestamp())
        }
    }

    fn rfc3339(&self) -> String {
        if self.utc {
            format!("{}Z", self.dt.format("%Y-%m-%dT%H:%M:%S"))
        } else {
            Local
                .from_local_datetime(&self.dt)
                .single()
                .map(|d| d.format("%Y-%m-%dT%H:%M:%S%:z").to_string())
                .unwrap_or_else(|| self.dt.format("%Y-%m-%dT%H:%M:%S").to_string())
        }
    }
}

fn parse_ymd(s: &str) -> Result<NaiveDate> {
    NaiveDate::parse_from_str(s, "%Y-%m-%d")
        .map_err(|_| anyhow!("invalid date {s:?} (use YYYY-MM-DD)"))
}

fn ymd_midnight(d: NaiveDate) -> NaiveDateTime {
    d.and_time(NaiveTime::MIN)
}

pub fn run(args: &DateArgs, json: bool) -> Result<()> {
    let mut now = DateVal {
        dt: Local::now().naive_local(),
        utc: false,
    };
    if !args.dates.is_empty() && args.diff.is_empty() {
        now = DateVal {
            dt: ymd_midnight(parse_ymd(&args.dates[0])?),
            utc: true,
        };
    }

    if !args.diff.is_empty() {
        let mut date1 = now;
        let date2;
        if args.dates.len() >= 2 {
            date2 = DateVal {
                dt: ymd_midnight(parse_ymd(&args.dates[1])?),
                utc: true,
            };
        } else {
            date2 = now;
            // Go ignores the parse error here, yielding the zero time; we fall
            // back to `now` to stay graceful.
            date1 = DateVal {
                dt: parse_ymd(&args.diff).map(ymd_midnight).unwrap_or(now.dt),
                utc: true,
            };
        }
        let mut days = (date2.dt - date1.dt).num_hours() / 24;
        if days < 0 {
            days = -days;
        }
        if json {
            return print_json(&json!({
                "date1": date1.dt.date().format("%Y-%m-%d").to_string(),
                "date2": date2.dt.date().format("%Y-%m-%d").to_string(),
                "days": days,
            }));
        }
        let (d1, d2) = (date1.dt.date(), date2.dt.date());
        let (before, after) = if d1 > d2 { (d2, d1) } else { (d1, d2) };
        println!(
            "{} → {}: {} days",
            before.format("%Y-%m-%d"),
            after.format("%Y-%m-%d"),
            days
        );
        return Ok(());
    }

    let mut result_date = now.dt.date();
    if args.add != 0 {
        result_date = add_date_component(result_date, 0, 0, args.add);
    }
    if args.add_months != 0 {
        result_date = add_date_component(result_date, 0, args.add_months, 0);
    }
    if args.add_years != 0 {
        result_date = add_date_component(result_date, args.add_years, 0, 0);
    }
    let result = DateVal {
        dt: result_date.and_time(now.dt.time()),
        utc: now.utc,
    };

    let output_format = if args.format.is_empty() {
        "%Y-%m-%d".to_string()
    } else {
        crate::timefmt::go_layout(&args.format)
    };

    if json {
        return print_json(&json!({
            "date": result.dt.format(&output_format).to_string(),
            "iso": result.rfc3339(),
            "unix": result.unix(),
            "weekday": weekday_name(result.dt.date()),
        }));
    }
    println!("{}", result.dt.format(&output_format));
    Ok(())
}
