use anyhow::{Context, Result};
use clap::Args;
use std::io::{BufRead, BufReader, Write};
use std::net::{TcpStream, ToSocketAddrs};
use std::time::Duration;

#[derive(Args)]
pub struct WhoisArgs {
    /// Domain to look up
    #[arg(long, short = 'd', default_value = "")]
    pub domain: String,
    /// WHOIS server to query
    #[arg(long, short = 's', default_value = "")]
    pub server: String,
}

fn lookup_server(domain: &str) -> String {
    let parts: Vec<&str> = domain.split('.').collect();
    if parts.len() < 2 {
        return "whois.iana.org".to_string();
    }
    let tld = parts[parts.len() - 1];
    match tld {
        "com" | "net" => "whois.verisign-grs.com",
        "org" => "whois.pir.org",
        "io" => "whois.nic.io",
        "dev" => "whois.nic.dev",
        "app" => "whois.nic.google",
        "ai" => "whois.nic.ai",
        "me" => "whois.nic.me",
        "co" => "whois.nic.co",
        "uk" => "whois.nic.uk",
        "de" => "whois.denic.de",
        "jp" => "whois.jprs.jp",
        "fr" => "whois.nic.fr",
        "xyz" => "whois.nic.xyz",
        other => return format!("whois.nic.{other}"),
    }
    .to_string()
}

pub fn run(args: &WhoisArgs) -> Result<()> {
    let domain = args.domain.trim();
    let server = if args.server.is_empty() {
        lookup_server(domain)
    } else {
        args.server.clone()
    };

    let addr = format!("{server}:43");
    let conn = TcpStream::connect_timeout(
        &addr
            .to_socket_addrs()
            .context("resolve whois server")?
            .next()
            .context("no address")?,
        Duration::from_secs(10),
    )
    .with_context(|| format!("connect to {server}"))?;
    conn.set_read_timeout(Some(Duration::from_secs(10))).ok();
    conn.set_write_timeout(Some(Duration::from_secs(10))).ok();

    let mut w = conn.try_clone()?;
    writeln!(w, "{domain}")?;

    let reader = BufReader::new(conn);
    let mut lines = Vec::new();
    for line in reader.lines() {
        lines.push(line?);
    }
    println!("{}", lines.join("\n"));
    Ok(())
}
