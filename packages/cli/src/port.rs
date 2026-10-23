use anyhow::{anyhow, Result};
use clap::{Args as ClapArgs, Subcommand};
use serde::Serialize;
use std::net::{TcpStream, ToSocketAddrs};
use std::time::Duration;

#[derive(ClapArgs)]
#[command(
    about = "Network port checking tools",
    long_about = "Check if ports are open, find available ports, and scan common ports."
)]
pub struct PortArgs {
    #[command(subcommand)]
    pub command: Option<PortCommand>,
    /// Output in JSON format
    #[arg(long, short = 'j', global = true)]
    pub json: bool,
}

#[derive(Subcommand)]
pub enum PortCommand {
    /// Check if a port is open
    Check(CheckArgs),
    /// Find an available port in a range
    Find(FindArgs),
    /// Scan common ports on a host
    Scan(ScanArgs),
}

#[derive(clap::Args)]
pub struct CheckArgs {
    /// Host:port to check
    #[arg(long, short = 'T', default_value = "")]
    pub target: String,
    /// Connection timeout in seconds
    #[arg(long, short = 't', default_value_t = 3)]
    pub timeout: u64,
}

#[derive(clap::Args)]
pub struct FindArgs {
    /// Start of port range
    #[arg(long, short = 's', default_value_t = 8000)]
    pub start: u16,
    /// End of port range
    #[arg(long, short = 'e', default_value_t = 9000)]
    pub end: u16,
}

#[derive(clap::Args)]
pub struct ScanArgs {
    /// Host to scan
    #[arg(long, short = 'H', default_value = "")]
    pub host: String,
    /// Port list (e.g. 22,80,443 or 8000-8100)
    #[arg(long, default_value = "")]
    pub ports: String,
    /// Per-port timeout in seconds
    #[arg(long, short = 't', default_value_t = 2)]
    pub timeout: u64,
}

const COMMON_PORTS: &[(u16, &str)] = &[
    (21, "FTP"),
    (22, "SSH"),
    (23, "Telnet"),
    (25, "SMTP"),
    (53, "DNS"),
    (80, "HTTP"),
    (110, "POP3"),
    (143, "IMAP"),
    (443, "HTTPS"),
    (465, "SMTPS"),
    (587, "SMTP Submission"),
    (993, "IMAPS"),
    (995, "POP3S"),
    (1433, "MSSQL"),
    (3306, "MySQL"),
    (3389, "RDP"),
    (5432, "PostgreSQL"),
    (6379, "Redis"),
    (8080, "HTTP-Alt"),
    (8443, "HTTPS-Alt"),
    (27017, "MongoDB"),
];

fn port_name(port: u16) -> &'static str {
    COMMON_PORTS
        .iter()
        .find(|(p, _)| *p == port)
        .map(|(_, n)| *n)
        .unwrap_or("Unknown")
}

fn build_port_list(s: &str) -> Vec<u16> {
    if s.is_empty() {
        let mut ports: Vec<u16> = COMMON_PORTS.iter().map(|(p, _)| *p).collect();
        ports.sort_unstable();
        return ports;
    }
    let mut ports = Vec::new();
    for part in s.split(',') {
        let part = part.trim();
        if let Some((start, end)) = part.split_once('-') {
            if let (Ok(start), Ok(end)) = (start.trim().parse::<u16>(), end.trim().parse::<u16>()) {
                if start <= end {
                    ports.extend(start..=end);
                }
            }
        } else if let Ok(p) = part.parse::<u16>() {
            ports.push(p);
        }
    }
    ports.sort_unstable();
    ports
}

fn check_port_open(addr: &str, timeout_secs: u64) -> bool {
    let addrs: Vec<_> = match addr.to_socket_addrs() {
        Ok(a) => a.collect(),
        Err(_) => return false,
    };
    for addr in addrs {
        if TcpStream::connect_timeout(&addr, Duration::from_secs(timeout_secs)).is_ok() {
            return true;
        }
    }
    false
}

fn split_host_port(s: &str) -> Result<(&str, &str)> {
    let (host, port) = s
        .rsplit_once(':')
        .ok_or_else(|| anyhow!("use host:port format (e.g. localhost:8080)"))?;
    if host.contains(':') && !(host.starts_with('[') && host.ends_with(']')) {
        return Err(anyhow!("use host:port format (e.g. localhost:8080)"));
    }
    Ok((host, port))
}

#[derive(Serialize)]
struct CheckJson {
    host: String,
    port: i64,
    open: bool,
}

fn run_check(args: &CheckArgs, json: bool) -> Result<()> {
    let host = &args.target;
    split_host_port(host)?;
    let open = check_port_open(host, args.timeout);
    if json {
        let mut parts = host.splitn(2, ':');
        let h = parts.next().unwrap_or("");
        let port_num = parts
            .next()
            .and_then(|p| p.parse::<i64>().ok())
            .unwrap_or(0);
        println!(
            "{}",
            serde_json::to_string_pretty(&CheckJson {
                host: h.to_string(),
                port: port_num,
                open,
            })?
        );
    } else if open {
        println!("Port {host} is open");
    } else {
        println!("Port {host} is closed");
    }
    Ok(())
}

fn find_available_port(start: u16, end: u16) -> Result<u16> {
    for port in start..=end {
        if !check_port_open(&format!("localhost:{port}"), 1) {
            return Ok(port);
        }
    }
    Err(anyhow!("no available ports in range {start}-{end}"))
}

fn run_find(args: &FindArgs, json: bool) -> Result<()> {
    let port = find_available_port(args.start, args.end)?;
    if json {
        println!(
            "{}",
            serde_json::to_string_pretty(&serde_json::json!({"port": port}))?
        );
    } else {
        println!("Available port: {port}");
    }
    Ok(())
}

#[derive(Serialize)]
struct PortInfo {
    port: u16,
    name: &'static str,
}

#[derive(Serialize)]
struct ScanJson {
    host: String,
    ports: Vec<PortInfo>,
}

fn run_scan(args: &ScanArgs, json: bool) -> Result<()> {
    let port_list = build_port_list(&args.ports);
    let host = args.host.as_str();
    let dial_host = if host.is_empty() { "localhost" } else { host };
    let mut open_ports = Vec::new();
    for p in port_list {
        if check_port_open(&format!("{dial_host}:{p}"), args.timeout) {
            open_ports.push(PortInfo {
                port: p,
                name: port_name(p),
            });
        }
    }
    if json {
        println!(
            "{}",
            serde_json::to_string_pretty(&ScanJson {
                host: host.to_string(),
                ports: open_ports,
            })?
        );
        return Ok(());
    }
    if open_ports.is_empty() {
        println!("No open ports found on {host}");
        return Ok(());
    }
    println!("Open ports on {host}:");
    println!("{}", "─".repeat(40));
    for p in &open_ports {
        println!("  {:5}  {}", p.port, p.name);
    }
    Ok(())
}

pub fn run(args: &PortArgs) -> Result<()> {
    let Some(command) = &args.command else {
        let mut cmd = <PortArgs as ClapArgs>::augment_args(clap::Command::new("port"));
        let _ = cmd.print_help();
        return Ok(());
    };
    match command {
        PortCommand::Check(a) => run_check(a, args.json),
        PortCommand::Find(a) => run_find(a, args.json),
        PortCommand::Scan(a) => run_scan(a, args.json),
    }
}
