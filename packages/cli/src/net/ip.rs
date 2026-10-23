use super::dns;
use anyhow::{anyhow, Result};
use clap::{Args, Subcommand};
use serde::Serialize;

#[derive(Args)]
pub struct IpArgs {
    /// Output raw JSON
    #[arg(long, short = 'r')]
    pub raw: bool,
    /// Output in JSON format
    #[arg(long)]
    pub json: bool,
    #[command(subcommand)]
    pub command: Option<IpCommand>,
}

#[derive(Subcommand)]
pub enum IpCommand {
    /// DNS record lookup
    Dns(dns::DnsArgs),
}

#[derive(Serialize)]
struct IpInfo {
    ip: String,
    version: String,
    #[serde(skip_serializing_if = "String::is_empty")]
    city: String,
    #[serde(skip_serializing_if = "String::is_empty")]
    region: String,
    #[serde(skip_serializing_if = "String::is_empty")]
    country_name: String,
    #[serde(skip_serializing_if = "String::is_empty")]
    country_code: String,
    #[serde(skip_serializing_if = "String::is_empty")]
    postal: String,
    #[serde(skip_serializing_if = "String::is_empty")]
    latitude: String,
    #[serde(skip_serializing_if = "String::is_empty")]
    longitude: String,
    #[serde(skip_serializing_if = "String::is_empty")]
    timezone: String,
    #[serde(skip_serializing_if = "String::is_empty")]
    org: String,
    #[serde(skip_serializing_if = "String::is_empty")]
    asn: String,
}

pub fn run(args: &IpArgs) -> Result<()> {
    if let Some(IpCommand::Dns(a)) = &args.command {
        return dns::run(a);
    }
    let ip = fetch_public_ip()?;
    match fetch_ipinfo(&ip) {
        Ok(info) => print_ip_info(&info, "IPinfo", args.raw || args.json),
        Err(e) => {
            eprintln!("IPinfo failed ({e}), falling back to ipapi...");
            let info = fetch_ipapi(&ip).map_err(|e2| anyhow!("both providers failed: {e2}"))?;
            print_ip_info(&info, "ipapi", args.raw || args.json);
        }
    }
    Ok(())
}

fn fetch_public_ip() -> Result<String> {
    let body = crate::requests::get("https://api.ipify.org?format=json")
        .map_err(|e| anyhow!("failed to fetch public IP: {e}"))?;
    let v: serde_json::Value =
        serde_json::from_slice(&body).map_err(|e| anyhow!("failed to parse IP response: {e}"))?;
    v["ip"]
        .as_str()
        .map(|s| s.to_string())
        .ok_or_else(|| anyhow!("failed to parse IP response: missing ip field"))
}

fn fetch_ipinfo(ip: &str) -> Result<IpInfo> {
    let body = crate::requests::get(&format!("https://ipinfo.io/{ip}/json"))
        .map_err(|e| anyhow!("IPinfo request failed: {e}"))?;
    let d: serde_json::Value = serde_json::from_slice(&body)
        .map_err(|e| anyhow!("failed to parse IPinfo response: {e}"))?;
    let s = |k: &str| d[k].as_str().unwrap_or("").to_string();
    let version = if ip.contains(':') { "IPv6" } else { "IPv4" };
    let (lat, lon) = s("loc")
        .split_once(',')
        .map(|(a, b)| (a.to_string(), b.to_string()))
        .unwrap_or_default();
    Ok(IpInfo {
        ip: s("ip"),
        version: version.to_string(),
        city: s("city"),
        region: s("region"),
        country_name: s("country"),
        country_code: s("country"),
        postal: s("postal"),
        latitude: lat,
        longitude: lon,
        timezone: s("timezone"),
        org: s("org"),
        asn: s("org"),
    })
}

fn fetch_ipapi(ip: &str) -> Result<IpInfo> {
    let body = crate::requests::get(&format!("https://ipapi.co/{ip}/json/"))
        .map_err(|e| anyhow!("ipapi request failed: {e}"))?;
    let d: serde_json::Value = serde_json::from_slice(&body)
        .map_err(|e| anyhow!("failed to parse ipapi response: {e}"))?;
    let s = |k: &str| d[k].as_str().unwrap_or("").to_string();
    let f = |k: &str| d[k].as_f64().unwrap_or(0.0);
    Ok(IpInfo {
        ip: s("ip"),
        version: s("version"),
        city: s("city"),
        region: s("region"),
        country_name: s("country_name"),
        country_code: s("country_code"),
        postal: s("postal"),
        latitude: format!("{:?}", f("latitude")),
        longitude: format!("{:?}", f("longitude")),
        timezone: s("timezone"),
        org: s("org"),
        asn: s("asn"),
    })
}

fn detect_vpn(org: &str) -> bool {
    let lower = org.to_lowercase();
    [
        "cloudflare",
        "amazon",
        "google",
        "digitalocean",
        "microsoft",
    ]
    .iter()
    .any(|kw| lower.contains(kw))
}

fn print_ip_info(info: &IpInfo, provider: &str, raw: bool) {
    if raw {
        println!("{}", serde_json::to_string_pretty(info).unwrap_or_default());
        return;
    }
    println!("Provider    : {provider}\n");
    println!("── Network Info ──────────────────────");
    println!("IP          : {}", info.ip);
    println!("Version     : {}", info.version);
    println!("ASN         : {}", info.asn);
    println!("Organization: {}", info.org);
    println!("Timezone    : {}", info.timezone);
    println!();
    println!("── Location ──────────────────────────");
    println!("Country     : {}", info.country_name);
    println!("Region      : {}", info.region);
    println!("City        : {}", info.city);
    println!("Postal      : {}", info.postal);
    println!("Coordinates : {}, {}", info.latitude, info.longitude);
    if detect_vpn(&info.org) {
        println!("\n⚠  Shared hosting / VPN detected. Rate limiting may occur.");
    }
}
