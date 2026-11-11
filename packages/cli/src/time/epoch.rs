use super::rfc3339;
use anyhow::{anyhow, Result};
use chrono::{DateTime, Duration, Local, NaiveDate, NaiveDateTime, NaiveTime, TimeZone, Utc};
use clap::Args;

#[derive(Args)]
pub struct EpochArgs {
    /// Unix epoch timestamp
    #[arg()]
    pub timestamp: Option<String>,
    /// Convert a date string to epoch
    #[arg(long, default_value = "")]
    pub from: String,
    /// Calculate epoch relative to now (e.g. '2 hours ago')
    #[arg(long, default_value = "")]
    pub relative: String,
    /// Output format string (Go time layout)
    #[arg(long, default_value = "")]
    pub format: String,
    /// Output in ISO 8601 format
    #[arg(long)]
    pub iso: bool,
    /// Output Unix timestamp
    #[arg(long)]
    pub unix: bool,
}

fn parse_epoch_date(s: &str) -> Result<DateTime<Utc>> {
    if let Ok(t) = DateTime::parse_from_rfc3339(s) {
        return Ok(t.with_timezone(&Utc));
    }
    // RFC1123: "Mon, 02 Jan 2006 15:04:05 MST"
    for fmt in ["%a, %d %b %Y %H:%M:%S %Z", "%a, %d %b %Y %H:%M:%S %z"] {
        if let Ok(t) = DateTime::parse_from_str(s, fmt) {
            return Ok(t.with_timezone(&Utc));
        }
    }
    for layout in ["%Y-%m-%dT%H:%M:%S", "%Y-%m-%d %H:%M:%S"] {
        if let Ok(t) = NaiveDateTime::parse_from_str(s, layout) {
            return Ok(Utc.from_utc_datetime(&t));
        }
    }
    if let Ok(d) = NaiveDate::parse_from_str(s, "%Y-%m-%d") {
        return Ok(Utc.from_utc_datetime(&d.and_time(NaiveTime::MIN)));
    }
    Err(anyhow!("unable to parse date: {s}"))
}

fn parse_relative(s: &str) -> Result<DateTime<Utc>> {
    let s = s.trim();
    let mut parts: Vec<&str> = s.split_whitespace().collect();
    if parts.len() < 2 {
        return Err(anyhow!("invalid relative time: {s}"));
    }
    let mut sign: i64 = 1;
    let mut offset = parts[0];
    if let Some(rest) = offset.strip_prefix('+') {
        offset = rest;
    } else if let Some(rest) = offset.strip_prefix('-') {
        sign = -1;
        offset = rest;
    } else if parts
        .last()
        .map(|p| p.eq_ignore_ascii_case("ago"))
        .unwrap_or(false)
    {
        sign = -1;
        parts.pop();
        offset = parts[0];
    }
    let n: i64 = offset
        .parse()
        .map_err(|_| anyhow!("invalid number: {offset}"))?;
    let unit = parts
        .get(1)
        .ok_or_else(|| anyhow!("missing time unit"))?
        .to_lowercase();
    let secs = if unit.starts_with("second") {
        n
    } else if unit.starts_with("minute") {
        n * 60
    } else if unit.starts_with("hour") {
        n * 3600
    } else if unit.starts_with("day") {
        n * 86400
    } else if unit.starts_with("week") {
        n * 7 * 86400
    } else if unit.starts_with("month") {
        n * 30 * 86400
    } else if unit.starts_with("year") {
        n * 365 * 86400
    } else {
        return Err(anyhow!("unknown time unit: {unit}"));
    };
    Ok(Utc::now() + Duration::seconds(sign * secs))
}

fn print_json(epoch: i64, rfc: &str) {
    println!("{{\"epoch\":{epoch},\"rfc3339\":\"{rfc}\"}}");
}

pub fn run(args: &EpochArgs, json: bool) -> Result<()> {
    if !args.from.is_empty() {
        let t = parse_epoch_date(&args.from).map_err(|e| anyhow!("invalid date: {e}"))?;
        if json {
            print_json(t.timestamp(), &rfc3339(&t));
        } else {
            println!("{}", t.timestamp());
        }
        return Ok(());
    }
    if !args.relative.is_empty() {
        let t =
            parse_relative(&args.relative).map_err(|e| anyhow!("invalid relative time: {e}"))?;
        if json {
            print_json(t.timestamp(), &rfc3339(&t));
        } else {
            println!("{}", t.timestamp());
        }
        return Ok(());
    }
    if let Some(ts_str) = &args.timestamp {
        let ts: i64 = ts_str
            .parse()
            .map_err(|_| anyhow!("invalid timestamp: {ts_str}"))?;
        let t = Utc.timestamp_opt(ts, 0).single().unwrap_or_else(Utc::now);
        if json {
            print_json(ts, &rfc3339(&t));
        } else if args.unix {
            println!("{ts}");
        } else if args.iso {
            println!("{}", rfc3339(&t));
        } else if !args.format.is_empty() {
            println!("{}", t.format(&crate::timefmt::go_layout(&args.format)));
        } else {
            // Go RFC1123 in local zone? t is UTC-based time.Unix -> local!
            let local = t.with_timezone(&Local);
            println!("{}", super::rfc1123(&local));
        }
        return Ok(());
    }
    let now = Utc::now();
    if json {
        print_json(now.timestamp(), &rfc3339(&now));
    } else {
        println!("{}", now.timestamp());
    }
    Ok(())
}
