use anyhow::{anyhow, Result};
use chrono::{DateTime, NaiveDate, NaiveDateTime, NaiveTime, TimeZone, Utc};

/// Parse a datetime string using the same layouts as
/// cli.go/src/cmd/time/internal.ParseDatetime. Parsed values are UTC,
/// matching Go's time.Parse (no zone in layout => UTC).
pub fn parse_datetime(s: &str) -> Result<DateTime<Utc>> {
    if let Ok(t) = DateTime::parse_from_rfc3339(s) {
        return Ok(t.with_timezone(&Utc));
    }
    for layout in ["%Y-%m-%dT%H:%M:%S", "%Y-%m-%d %H:%M:%S"] {
        if let Ok(t) = NaiveDateTime::parse_from_str(s, layout) {
            return Ok(Utc.from_utc_datetime(&t));
        }
    }
    if let Ok(d) = NaiveDate::parse_from_str(s, "%Y-%m-%d") {
        return Ok(Utc.from_utc_datetime(&d.and_time(NaiveTime::MIN)));
    }
    Err(anyhow!("unable to parse datetime: {s}"))
}
