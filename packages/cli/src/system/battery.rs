use anyhow::Result;
use clap::Args;
use serde::Serialize;
use std::process::Command;

#[derive(Args)]
pub struct BatteryArgs {}

#[derive(Serialize)]
struct Info {
    percent: i64,
    charging: bool,
    #[serde(skip_serializing_if = "String::is_empty")]
    time_remaining: String,
}

pub fn run(_args: &BatteryArgs, json: bool) -> Result<()> {
    match std::env::consts::OS {
        "macos" => darwin_battery(json),
        "linux" => linux_battery(json),
        os => Err(anyhow::anyhow!("unsupported platform: {os}")),
    }
}

fn print_battery(b: &Info, json: bool) -> Result<()> {
    if json {
        println!("{}", serde_json::to_string_pretty(b)?);
    } else {
        let status = if b.charging {
            "charging"
        } else {
            "discharging"
        };
        println!("Battery: {}% ({})", b.percent, status);
        if !b.time_remaining.is_empty() {
            println!("Time remaining: {}", b.time_remaining);
        }
    }
    Ok(())
}

fn darwin_battery(json: bool) -> Result<()> {
    let out = Command::new("pmset")
        .args(["-g", "batt"])
        .output()
        .map_err(|e| anyhow::anyhow!("pmset failed: {e}"))?;
    print_battery(&parse_darwin(&String::from_utf8_lossy(&out.stdout)), json)
}

fn parse_darwin(out: &str) -> Info {
    let mut info = Info {
        percent: 0,
        charging: false,
        time_remaining: String::new(),
    };
    for line in out.lines() {
        if !line.contains("InternalBattery") {
            continue;
        }
        for f in line.split_whitespace() {
            if let Some(pct) = f.strip_suffix('%') {
                if let Ok(v) = pct.parse::<i64>() {
                    info.percent = v;
                }
            }
            if f == "charging" || f == "AC" || f == "charged" {
                info.charging = true;
            }
            if f.ends_with(';') && f.len() > 4 {
                let t = f.trim_end_matches(';');
                if t.contains(':') {
                    info.time_remaining = t.to_string();
                }
            }
        }
    }
    info
}

fn linux_battery(json: bool) -> Result<()> {
    let mut info = Info {
        percent: 0,
        charging: false,
        time_remaining: String::new(),
    };
    let cap = read_trim("/sys/class/power_supply/BAT0/capacity")
        .map_err(|e| anyhow::anyhow!("read battery capacity: {e}"))?;
    if let Ok(v) = cap.parse::<i64>() {
        info.percent = v;
    }
    if let Ok(status) = read_trim("/sys/class/power_supply/BAT0/status") {
        info.charging = status == "Charging";
    }
    print_battery(&info, json)
}

fn read_trim(path: &str) -> Result<String, std::io::Error> {
    std::fs::read_to_string(path).map(|s| s.trim().to_string())
}
