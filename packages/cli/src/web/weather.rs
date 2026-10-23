use super::internal;
use anyhow::{anyhow, Result};
use clap::Args;
use serde_json::Value;

#[derive(Args)]
pub struct WeatherArgs {
    /// City name (detected from IP if omitted)
    pub city: Option<String>,
    /// Show 3-day forecast
    #[arg(long, short = 'f')]
    pub forecast: bool,
    /// Units: metric, imperial, uk
    #[arg(long, short = 'u', default_value = "metric")]
    pub units: String,
}

fn detect_location() -> Result<String> {
    let body = crate::requests::get("https://ipinfo.io/json")?;
    let data: Value = serde_json::from_slice(&body).map_err(|e| anyhow!("parse: {e}"))?;
    let city = data["city"].as_str().unwrap_or("");
    if city.is_empty() {
        return Err(anyhow!("could not detect city"));
    }
    Ok(city.to_string())
}

fn unit_param(units: &str) -> &'static str {
    match units {
        "imperial" => "u",
        "uk" => "M",
        _ => "m",
    }
}

pub fn run(args: &WeatherArgs, json: bool) -> Result<()> {
    let city = match &args.city {
        Some(c) if !c.is_empty() => c.clone(),
        _ => detect_location()?,
    };
    let unit = unit_param(&args.units);
    let url = if json {
        format!("https://wttr.in/{city}?format=j1&lang=en&{unit}")
    } else if args.forecast {
        format!("https://wttr.in/{city}?0&lang=en&{unit}")
    } else {
        // %25 decodes to a literal % on the server (wttr.in format codes)
        format!("https://wttr.in/{city}?format=%25C+%25t+%25w+%25h&{unit}")
    };
    let body = internal::fetch_page_raw(&url)?;
    if json {
        let v: Value = serde_json::from_str(&body).map_err(|e| anyhow!("parse: {e}"))?;
        println!("{}", serde_json::to_string_pretty(&v)?);
    } else {
        println!("{}", body.trim());
    }
    Ok(())
}
