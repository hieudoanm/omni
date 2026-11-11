pub mod cert;
pub mod dns;
pub mod http_cmd;
pub mod ip;
pub mod ping;
pub mod serve;
pub mod status;
pub mod whois;
pub mod wifi;

use anyhow::Result;
use clap::{Args, Subcommand};

#[derive(Args)]
pub struct NetArgs {
    #[command(subcommand)]
    pub command: Option<NetCommand>,
}

#[derive(Subcommand)]
pub enum NetCommand {
    /// SSL/TLS certificate inspection
    Cert(cert::CertArgs),
    /// Make HTTP requests
    #[command(name = "http")]
    Http(http_cmd::HttpArgs),
    /// Look up your public IP and geolocation
    Ip(ip::IpArgs),
    /// TCP ping to check host reachability
    Ping(ping::PingArgs),
    /// Start an HTTP file server
    Serve(serve::ServeArgs),
    /// Check the uptime status of cloud services
    Status(status::StatusArgs),
    /// WHOIS lookup for a domain
    Whois(whois::WhoisArgs),
    /// List nearby Wi-Fi networks
    Wifi(wifi::WifiArgs),
}

pub fn run(args: &NetArgs) -> Result<()> {
    match &args.command {
        Some(NetCommand::Cert(a)) => cert::run(a),
        Some(NetCommand::Http(a)) => http_cmd::run(a),
        Some(NetCommand::Ip(a)) => ip::run(a),
        Some(NetCommand::Ping(a)) => ping::run(a),
        Some(NetCommand::Serve(a)) => serve::run(a),
        Some(NetCommand::Status(a)) => status::run(a),
        Some(NetCommand::Whois(a)) => whois::run(a),
        Some(NetCommand::Wifi(a)) => wifi::run(a),
        None => {
            println!("Network diagnostics and servers\n");
            println!("Usage:\n  omni net [command]\n");
            println!("Available Commands:");
            println!("  cert     SSL/TLS certificate inspection");
            println!("  http     Make HTTP requests");
            println!("  ip       Look up your public IP and geolocation");
            println!("  ping     TCP ping to check host reachability");
            println!("  serve    Start an HTTP file server");
            println!("  status   Check the uptime status of cloud services");
            println!("  whois    WHOIS lookup for a domain");
            println!("  wifi     List nearby Wi-Fi networks");
            println!("\nFlags:\n  -h, --help   help for net");
            Ok(())
        }
    }
}
