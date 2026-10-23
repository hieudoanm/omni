use anyhow::{anyhow, Result};
use chrono::{Datelike, Duration, Local, NaiveDateTime, NaiveTime, TimeZone, Timelike};
use clap::Args;
use serde_json::json;
use std::collections::HashMap;

#[derive(Args)]
pub struct CronArgs {
    /// Cron expression
    #[arg(long, short = 'e', default_value = "")]
    pub expression: String,
    /// Show next N run times
    #[arg(long, short = 'n', default_value_t = 0)]
    pub next: i64,
    /// Show runs until this date (YYYY-MM-DD)
    #[arg(long, default_value = "")]
    pub until: String,
}

fn month_names() -> HashMap<&'static str, i64> {
    [
        ("jan", 1),
        ("feb", 2),
        ("mar", 3),
        ("apr", 4),
        ("may", 5),
        ("jun", 6),
        ("jul", 7),
        ("aug", 8),
        ("sep", 9),
        ("oct", 10),
        ("nov", 11),
        ("dec", 12),
    ]
    .into_iter()
    .collect()
}

fn week_names() -> HashMap<&'static str, i64> {
    [
        ("sun", 0),
        ("mon", 1),
        ("tue", 2),
        ("wed", 3),
        ("thu", 4),
        ("fri", 5),
        ("sat", 6),
    ]
    .into_iter()
    .collect()
}

fn resolve_name(val: &str, names: &HashMap<&'static str, i64>) -> String {
    names
        .get(&val.to_lowercase()[..])
        .map(|n| n.to_string())
        .unwrap_or_else(|| val.to_string())
}

fn match_field(field: &str, value: i64, _min: i64, _max: i64) -> bool {
    if field == "*" {
        return true;
    }
    if let Some(step_str) = field.strip_prefix("*/") {
        let Ok(step) = step_str.parse::<i64>() else {
            return false;
        };
        if step == 0 {
            return false;
        }
        return value % step == 0;
    }
    if field.contains(',') {
        return field
            .split(',')
            .map(str::trim)
            .any(|part| match_field(part, value, 0, 59));
    }
    if field.contains('-') {
        let mut parts = field.splitn(2, '-');
        let (Some(a), Some(b)) = (parts.next(), parts.next()) else {
            return false;
        };
        if let (Ok(start), Ok(end)) = (a.parse::<i64>(), b.parse::<i64>()) {
            return value >= start && value <= end;
        }
        return false;
    }
    field.parse::<i64>().map(|v| v == value).unwrap_or(false)
}

fn cron_next_runs(expression: &str, count: i64, until_ts: i64) -> Vec<NaiveDateTime> {
    let parts: Vec<&str> = expression.split_whitespace().collect();
    if parts.len() != 5 {
        return Vec::new();
    }
    let months = month_names();
    let weeks = week_names();
    let mut fields = Vec::with_capacity(5);
    for (i, part) in parts.iter().enumerate() {
        let resolved = resolve_name(part, &months);
        fields.push(if i == 4 {
            resolve_name(&resolved, &weeks)
        } else {
            resolved
        });
    }

    let mut runs = Vec::new();
    let now = Local::now().naive_local() + Duration::minutes(1);
    let mut candidate = NaiveDateTime::new(
        now.date(),
        NaiveTime::from_hms_opt(now.hour(), now.minute(), 0).unwrap(),
    );
    // Local offset is stable enough for the scan horizon in practice.
    let offset_secs = Local
        .offset_from_local_datetime(&candidate)
        .single()
        .map(|o| o.local_minus_utc() as i64)
        .unwrap_or(0);
    while (runs.len() as i64) < count {
        candidate += Duration::minutes(1);
        let ts = candidate.and_utc().timestamp() - offset_secs;
        if ts > until_ts {
            break;
        }
        if !match_field(&fields[0], candidate.minute() as i64, 0, 59) {
            continue;
        }
        if !match_field(&fields[1], candidate.hour() as i64, 0, 23) {
            continue;
        }
        if !match_field(&fields[2], candidate.day() as i64, 1, 31) {
            continue;
        }
        if !match_field(&fields[3], candidate.month() as i64, 1, 12) {
            continue;
        }
        // Go Weekday(): Sunday=0..Saturday=6; chrono: Mon=0..Sun=6
        let dow = match candidate.weekday() {
            chrono::Weekday::Sun => 0,
            chrono::Weekday::Mon => 1,
            chrono::Weekday::Tue => 2,
            chrono::Weekday::Wed => 3,
            chrono::Weekday::Thu => 4,
            chrono::Weekday::Fri => 5,
            chrono::Weekday::Sat => 6,
        };
        if !match_field(&fields[4], dow, 0, 6) {
            continue;
        }
        runs.push(candidate);
    }
    runs
}

fn expand_field(
    field: &str,
    _min: i64,
    _max: i64,
    names: Option<&HashMap<&'static str, i64>>,
) -> String {
    if field == "*" {
        return "every".into();
    }
    if let Some(rest) = field.strip_prefix("*/") {
        return match rest.parse::<i64>() {
            Ok(n) => format!("every {n}"),
            Err(_) => field.to_string(),
        };
    }
    if field.contains('-') {
        let mut parts = field.splitn(2, '-');
        let (a, b) = (parts.next().unwrap_or(""), parts.next().unwrap_or(""));
        let ra = names
            .map(|n| resolve_name(a, n))
            .unwrap_or_else(|| a.to_string());
        let rb = names
            .map(|n| resolve_name(b, n))
            .unwrap_or_else(|| b.to_string());
        return format!("{ra}-{rb}");
    }
    if field.contains(',') {
        return field.to_string();
    }
    names
        .map(|n| resolve_name(field, n))
        .unwrap_or_else(|| field.to_string())
}

fn zeropad(s: &str) -> String {
    match s.parse::<i64>() {
        Ok(n) if n < 10 => format!("0{n}"),
        _ => s.to_string(),
    }
}

fn cron_describe(expr: &str) -> String {
    let fields: Vec<&str> = expr.split_whitespace().collect();
    if fields.len() != 5 {
        return "invalid cron expression (need 5 fields)".into();
    }
    let months = month_names();
    let weeks = week_names();
    let minute = expand_field(fields[0], 0, 59, None);
    let hour = expand_field(fields[1], 0, 23, None);
    let dom = expand_field(fields[2], 1, 31, None);
    let month = expand_field(fields[3], 1, 12, Some(&months));
    let dow = expand_field(fields[4], 0, 6, Some(&weeks));

    let mut parts = Vec::new();
    if minute == "every" && hour == "every" {
        parts.push("every minute".to_string());
    } else if hour == "every" {
        parts.push(format!("minute {minute} of every hour"));
    } else if minute == "every" {
        parts.push(format!("every minute of hour {hour}"));
    } else {
        parts.push(format!("at {}:{}", zeropad(&hour), zeropad(&minute)));
    }
    if month != "*" && month != "every" {
        parts.push(format!("in {month}"));
    }
    if dom != "*" && dom != "every" {
        parts.push(format!("on day {dom}"));
    }
    if dow != "*" && dow != "every" {
        parts.push(format!("on {dow}"));
    }
    parts.join(" ")
}

fn fmt_run(t: &NaiveDateTime) -> String {
    // Go: "2006-01-02 15:04 Mon"
    let dow = match t.weekday() {
        chrono::Weekday::Mon => "Mon",
        chrono::Weekday::Tue => "Tue",
        chrono::Weekday::Wed => "Wed",
        chrono::Weekday::Thu => "Thu",
        chrono::Weekday::Fri => "Fri",
        chrono::Weekday::Sat => "Sat",
        chrono::Weekday::Sun => "Sun",
    };
    format!("{} {}", t.format("%Y-%m-%d %H:%M"), dow)
}

pub fn run(args: &CronArgs, json: bool) -> Result<()> {
    let until_ts = if args.until.is_empty() {
        // Go: time.Date(2100,1,1,...) Local
        let d = NaiveDateTime::parse_from_str("2100-01-01 00:00:00", "%Y-%m-%d %H:%M:%S").unwrap();
        Local
            .from_local_datetime(&d)
            .single()
            .map(|t| t.timestamp())
            .unwrap_or(0)
    } else {
        let d =
            NaiveDateTime::parse_from_str(&format!("{} 00:00:00", args.until), "%Y-%m-%d %H:%M:%S")
                .map_err(|_| anyhow!("invalid --until date: {}", args.until))?;
        // Go parses as UTC midnight
        d.and_utc().timestamp()
    };

    let runs = if args.next > 0 {
        cron_next_runs(&args.expression, args.next, until_ts)
    } else {
        Vec::new()
    };

    if json {
        let run_strs: Vec<String> = runs.iter().map(fmt_run).collect();
        println!(
            "{}",
            serde_json::to_string_pretty(&json!({
                "expression": args.expression,
                "description": cron_describe(&args.expression),
                "next_runs": run_strs,
            }))?
        );
        return Ok(());
    }
    println!("Expression: {}", args.expression);
    println!("Description: {}", cron_describe(&args.expression));
    println!();
    if !runs.is_empty() {
        println!("Next {} runs:", runs.len());
        for (i, t) in runs.iter().enumerate() {
            println!("  {:>2}. {}", i + 1, fmt_run(t));
        }
    }
    Ok(())
}
