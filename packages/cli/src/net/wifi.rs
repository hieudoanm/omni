use anyhow::Result;
use clap::Args;
use serde_json::json;
#[cfg(target_os = "linux")]
use std::process::Command;

#[derive(Args)]
pub struct WifiArgs {
    /// Output in JSON format
    #[arg(long)]
    pub json: bool,
}

fn scan_wifi() -> Result<String> {
    #[cfg(target_os = "linux")]
    {
        let out = Command::new("nmcli")
            .args([
                "--terse",
                "--fields",
                "SSID,SIGNAL,SECURITY",
                "device",
                "wifi",
                "list",
            ])
            .output()
            .map_err(|e| anyhow::anyhow!("nmcli: {e}"))?;
        if !out.status.success() {
            return Err(anyhow::anyhow!(
                "nmcli: {}",
                String::from_utf8_lossy(&out.stderr)
            ));
        }
        let mut sb = String::new();
        for line in String::from_utf8_lossy(&out.stdout).trim().lines() {
            let parts: Vec<&str> = line.splitn(3, ':').collect();
            if parts.len() != 3 {
                continue;
            }
            let ssid = if parts[0].is_empty() {
                "<hidden>"
            } else {
                parts[0]
            };
            sb.push_str(&format!("{} | RSSI: {} | {}\n", ssid, parts[1], parts[2]));
        }
        return Ok(sb);
    }
    #[cfg(not(target_os = "linux"))]
    {
        // Go's nocgo darwin build returns an empty result (CoreWLAN needs cgo).
        Ok(String::new())
    }
}

fn parse_wifi_output(out: &str) -> Vec<serde_json::Value> {
    let mut networks = Vec::new();
    for line in out.trim().lines() {
        let line = line.trim();
        if line.is_empty() {
            continue;
        }
        let parts: Vec<&str> = line.splitn(3, " | ").collect();
        if parts.len() < 3 {
            continue;
        }
        let rssi: i64 = parts[1]
            .trim_start_matches("RSSI: ")
            .trim()
            .parse()
            .unwrap_or(0);
        networks.push(json!({
            "ssid": parts[0],
            "rssi": rssi,
            "security": parts[2].trim(),
        }));
    }
    networks
}

pub fn run(args: &WifiArgs) -> Result<()> {
    let out = scan_wifi()?;
    if args.json {
        let networks = parse_wifi_output(&out);
        println!("{}", serde_json::to_string_pretty(&networks)?);
    } else {
        println!("{out}");
    }
    Ok(())
}
