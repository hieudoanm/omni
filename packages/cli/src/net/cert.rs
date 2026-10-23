use anyhow::{anyhow, Context, Result};
use base64::Engine;
use clap::{Args, Subcommand};
use serde::Serialize;
use std::process::{Command, Stdio};

#[derive(Args)]
pub struct CertArgs {
    #[command(subcommand)]
    pub command: Option<CertCommand>,
}

#[derive(Subcommand)]
pub enum CertCommand {
    /// Show detailed certificate information
    Info(InfoArgs),
    /// Quick certificate health check (expiry warning)
    Check(CheckArgs),
}

#[derive(Args)]
pub struct InfoArgs {
    /// Host:port to inspect
    #[arg(long, short = 'H', default_value = "")]
    pub host: String,
    /// Output in JSON format
    #[arg(long)]
    pub json: bool,
}

#[derive(Args)]
pub struct CheckArgs {
    /// Host:port to check
    #[arg(long, short = 'H', default_value = "")]
    pub host: String,
    /// Output in JSON format
    #[arg(long)]
    pub json: bool,
}

#[derive(Serialize)]
struct CertJson {
    subject: String,
    issuer: String,
    serial: String,
    version: i64,
    #[serde(rename = "notBefore")]
    not_before: String,
    #[serde(rename = "notAfter")]
    not_after: String,
    expired: bool,
    remaining: String,
    #[serde(skip)]
    remaining_secs: i64,
    #[serde(skip_serializing_if = "Vec::is_empty", rename = "dnsNames")]
    dns_names: Vec<String>,
    #[serde(skip_serializing_if = "Vec::is_empty", rename = "ipAddresses")]
    ip_addresses: Vec<String>,
    #[serde(rename = "signatureAlgorithm")]
    signature_algo: String,
    #[serde(rename = "publicKeyAlgorithm")]
    public_key_algo: String,
}

#[derive(Serialize)]
struct CertCheck {
    host: String,
    subject: String,
    issuer: String,
    #[serde(rename = "notAfter")]
    not_after: String,
    remaining: String,
    status: String,
    #[serde(rename = "dnsNames")]
    dns_names: Vec<String>,
    #[serde(rename = "dnsNamesCount")]
    dns_count: usize,
}

fn normalize_host(host: &str) -> String {
    if host.contains(':') {
        host.to_string()
    } else {
        format!("{host}:443")
    }
}

fn go_dur_secs(secs: i64) -> String {
    let neg = secs < 0;
    let secs = secs.abs();
    let (h, m, s) = (secs / 3600, (secs % 3600) / 60, secs % 60);
    let body = if h > 0 {
        format!("{h}h{m}m{s}s")
    } else if m > 0 {
        format!("{m}m{s}s")
    } else {
        format!("{s}s")
    };
    if neg {
        format!("-{body}")
    } else {
        body
    }
}

fn fmt_time(ts: i64) -> String {
    chrono::DateTime::from_timestamp(ts, 0)
        .map(|d| d.format("%Y-%m-%d %H:%M:%S").to_string())
        .unwrap_or_default()
}

fn sig_algo_name(oid: &str) -> String {
    match oid {
        "1.2.840.113549.1.1.11" => "SHA256-RSA",
        "1.2.840.113549.1.1.12" => "SHA384-RSA",
        "1.2.840.113549.1.1.13" => "SHA512-RSA",
        "1.2.840.113549.1.1.14" => "SHA224-RSA",
        "1.2.840.113549.1.1.5" => "SHA1-RSA",
        "1.2.840.113549.1.1.4" => "MD5-RSA",
        "1.2.840.113549.1.1.10" => "RSA-PSS",
        "1.2.840.10045.4.3.1" => "ECDSA-SHA224",
        "1.2.840.10045.4.3.2" => "ECDSA-SHA256",
        "1.2.840.10045.4.3.3" => "ECDSA-SHA384",
        "1.2.840.10045.4.3.4" => "ECDSA-SHA512",
        "1.2.840.10045.4.1" => "ECDSA-SHA1",
        "1.3.101.112" => "Ed25519",
        "1.3.101.113" => "Ed448",
        _ => oid,
    }
    .to_string()
}

fn pk_algo_name(oid: &str) -> String {
    match oid {
        "1.2.840.113549.1.1.1" => "RSA",
        "1.2.840.10045.2.1" => "EC",
        "1.2.840.10040.4.1" => "DSA",
        "1.3.101.110" => "Ed25519",
        "1.3.101.111" => "X25519",
        "1.3.101.112" => "Ed25519",
        "1.3.101.113" => "Ed448",
        "1.3.101.114" => "X448",
        _ => oid,
    }
    .to_string()
}

/// Fetch the peer certificate chain via `openssl s_client` and parse it.
fn fetch_certs(host: &str) -> Result<Vec<CertJson>> {
    let host = normalize_host(host);
    let servername = host.split(':').next().unwrap_or(&host);
    let out = Command::new("openssl")
        .args([
            "s_client",
            "-connect",
            &host,
            "-servername",
            servername,
            "-showcerts",
        ])
        .stdin(Stdio::null())
        .stderr(Stdio::null())
        .output()
        .context("openssl not found or failed to run")?;
    if !out.status.success() {
        return Err(anyhow!(
            "connection failed: {}",
            String::from_utf8_lossy(&out.stderr)
        ));
    }
    let text = String::from_utf8_lossy(&out.stdout);

    let mut certs = Vec::new();
    let mut rest = text.as_ref();
    while let Some(start) = rest.find("-----BEGIN CERTIFICATE-----") {
        let after = &rest[start..];
        let Some(end) = after.find("-----END CERTIFICATE-----") else {
            break;
        };
        let pem = &after[..end + "-----END CERTIFICATE-----".len()];
        rest = &after[end + "-----END CERTIFICATE-----".len()..];
        let b64: String = pem
            .lines()
            .filter(|l| !l.starts_with("-----"))
            .collect::<Vec<_>>()
            .join("");
        let der = base64::engine::general_purpose::STANDARD
            .decode(b64.trim())
            .context("decode certificate PEM")?;
        let (_, cert) = x509_parser::parse_x509_certificate(&der)
            .map_err(|e| anyhow!("parse certificate: {e}"))?;

        let now = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_secs() as i64;
        let not_after = cert.validity().not_after.timestamp();
        let remaining_secs = (not_after - now) as f64;

        let mut dns_names = Vec::new();
        let mut ip_addresses = Vec::new();
        if let Ok(Some(san)) = cert.tbs_certificate.subject_alternative_name() {
            for n in san.value.general_names.iter() {
                use x509_parser::extensions::GeneralName;
                match n {
                    GeneralName::DNSName(d) => dns_names.push(d.to_string()),
                    GeneralName::IPAddress(bytes) => {
                        let ip = if bytes.len() == 4 {
                            std::net::IpAddr::V4(std::net::Ipv4Addr::new(
                                bytes[0], bytes[1], bytes[2], bytes[3],
                            ))
                        } else if bytes.len() == 16 {
                            let mut o = [0u8; 16];
                            o.copy_from_slice(bytes);
                            std::net::IpAddr::V6(std::net::Ipv6Addr::from(o))
                        } else {
                            continue;
                        };
                        ip_addresses.push(ip.to_string());
                    }
                    _ => {}
                }
            }
        }

        certs.push(CertJson {
            subject: cert.tbs_certificate.subject().to_string(),
            issuer: cert.tbs_certificate.issuer().to_string(),
            serial: cert.tbs_certificate.serial.to_string(),
            version: cert.tbs_certificate.version.0 as i64 + 1,
            not_before: fmt_time(cert.tbs_certificate.validity().not_before.timestamp()),
            not_after: fmt_time(cert.tbs_certificate.validity().not_after.timestamp()),
            expired: remaining_secs < 0.0,
            remaining: go_dur_secs(remaining_secs.round() as i64),
            remaining_secs: remaining_secs.round() as i64,
            dns_names,
            ip_addresses,
            signature_algo: sig_algo_name(&cert.signature_algorithm.algorithm.to_id_string()),
            public_key_algo: pk_algo_name(
                &cert
                    .tbs_certificate
                    .public_key()
                    .algorithm
                    .algorithm
                    .to_id_string(),
            ),
        });
    }

    if certs.is_empty() {
        return Err(anyhow!("no certificates returned"));
    }
    Ok(certs)
}

fn print_cert_info(certs: &[CertJson]) {
    for (i, c) in certs.iter().enumerate() {
        println!("── Certificate {} ──────────────────────", i + 1);
        println!("Subject   : {}", c.subject);
        println!("Issuer    : {}", c.issuer);
        println!("Serial    : {}", c.serial);
        println!("Version   : {}", c.version);
        println!("\nValidity:");
        println!("  Not Before: {}", c.not_before);
        println!("  Not After : {}", c.not_after);
        if c.expired {
            println!("  Status    : EXPIRED");
        } else {
            println!("  Status    : Valid ({} remaining)", c.remaining);
        }
        if !c.dns_names.is_empty() {
            println!("\nDNS Names:");
            for n in &c.dns_names {
                println!("  - {n}");
            }
        }
        if !c.ip_addresses.is_empty() {
            println!("\nIP Addresses:");
            for ip in &c.ip_addresses {
                println!("  - {ip}");
            }
        }
        println!("\nSignature Algorithm: {}", c.signature_algo);
        println!("Public Key Algorithm: {}", c.public_key_algo);
        println!();
    }
}

pub fn run(args: &CertArgs) -> Result<()> {
    match &args.command {
        Some(CertCommand::Info(a)) => {
            let certs = fetch_certs(&a.host)?;
            if a.json {
                println!("{}", serde_json::to_string_pretty(&certs)?);
            } else {
                print_cert_info(&certs);
            }
        }
        Some(CertCommand::Check(a)) => {
            let certs = fetch_certs(&a.host)?;
            let leaf = &certs[0];
            let check = CertCheck {
                host: a.host.clone(),
                subject: leaf.subject.clone(),
                issuer: leaf.issuer.clone(),
                not_after: leaf.not_after.clone(),
                remaining: leaf.remaining.clone(),
                status: if leaf.expired {
                    "expired".to_string()
                } else if leaf.remaining_secs < 30 * 24 * 3600 {
                    "expiring_soon".to_string()
                } else {
                    "valid".to_string()
                },
                dns_names: leaf.dns_names.clone(),
                dns_count: leaf.dns_names.len(),
            };
            if a.json {
                println!("{}", serde_json::to_string_pretty(&check)?);
            } else {
                println!("Host      : {}", check.host);
                println!(
                    "Status    : {}",
                    match check.status.as_str() {
                        "expired" => "EXPIRED",
                        "expiring_soon" => "Expiring soon",
                        _ => "Valid",
                    }
                );
                println!("SANs      : {} DNS names", check.dns_count);
            }
        }
        None => {
            println!("SSL/TLS certificate inspection\n");
            println!("Usage:\n  omni net cert [command]\n");
            println!("Available Commands:");
            println!("  info   Show detailed certificate information");
            println!("  check  Quick certificate health check (expiry warning)");
        }
    }
    Ok(())
}
