use anyhow::Result;
use clap::Args;
use serde::Serialize;
use std::net::TcpStream;
use std::time::{Duration, Instant};

#[derive(Args)]
pub struct PingArgs {
    /// Host to ping
    #[arg(long, short = 'H', default_value = "")]
    pub host: String,
    /// TCP port
    #[arg(long, short = 'p', default_value_t = 80)]
    pub port: u16,
    /// Number of pings
    #[arg(long, short = 'c', default_value_t = 4)]
    pub count: i32,
    /// Per-ping timeout
    #[arg(long, short = 't', default_value = "5s")]
    pub timeout: String,
    /// Output in JSON format
    #[arg(long)]
    pub json: bool,
}

#[derive(Serialize)]
struct PingResult {
    seq: i32,
    success: bool,
    #[serde(skip_serializing_if = "String::is_empty")]
    latency: String,
    #[serde(skip_serializing_if = "String::is_empty")]
    error: String,
}

fn parse_duration(s: &str) -> Duration {
    let s = s.trim();
    let (num, unit) = s.split_at(s.len().saturating_sub(1));
    let n: f64 = num.parse().unwrap_or(0.0);
    let secs = match unit {
        "m" => n * 60.0,
        "h" => n * 3600.0,
        _ => n, // "s" or unitless = seconds
    };
    Duration::from_secs_f64(secs.max(0.0))
}

/// Go `time.Duration.String()` approximation (handles h/m/s + fraction).
fn go_dur(d: Duration) -> String {
    let secs = d.as_secs();
    let nanos = d.subsec_nanos();
    if secs == 0 {
        if nanos == 0 {
            return "0s".to_string();
        }
        if nanos < 1_000 {
            return format!("{}ns", nanos);
        }
        if nanos < 1_000_000 {
            return format!("{}µs", nanos / 1_000);
        }
        return format!("{}ms", nanos / 1_000_000);
    }
    let (h, m, s) = (secs / 3600, (secs % 3600) / 60, secs % 60);
    let mut base = if h > 0 {
        format!("{h}h{m}m{s}")
    } else if m > 0 {
        format!("{m}m{s}")
    } else {
        format!("{s}")
    };
    if nanos > 0 {
        let frac = format!("{nanos:09}");
        base.push('.');
        base.push_str(frac.trim_end_matches('0'));
    }
    base.push('s');
    base
}

fn round_ms(d: Duration) -> Duration {
    Duration::from_millis(((d.as_nanos() + 500_000) / 1_000_000) as u64)
}

pub fn run(args: &PingArgs) -> Result<()> {
    let mut count = args.count;
    if count < 1 {
        count = 4;
    }
    let timeout = parse_duration(&args.timeout);
    let addr = format!("{}:{}", args.host, args.port);

    let (mut successes, mut failures) = (0i32, 0i32);
    let mut total = Duration::ZERO;
    let mut results: Vec<PingResult> = Vec::new();

    for i in 0..count {
        let start = Instant::now();
        let sa = std::net::ToSocketAddrs::to_socket_addrs(&addr)
            .ok()
            .and_then(|mut it| it.next())
            .ok_or_else(|| {
                std::io::Error::new(
                    std::io::ErrorKind::NotFound,
                    format!("lookup {addr}: no such host"),
                )
            });
        let conn = match sa {
            Ok(sa) => TcpStream::connect_timeout(&sa, timeout),
            Err(e) => Err(e),
        };
        let elapsed = start.elapsed();

        match conn {
            Err(e) => {
                failures += 1;
                let r = PingResult {
                    seq: i + 1,
                    success: false,
                    latency: String::new(),
                    error: e.to_string(),
                };
                if args.json {
                    results.push(r);
                } else {
                    println!(
                        "PING {} (port {}) — seq={} time={} error={}",
                        args.host,
                        args.port,
                        i + 1,
                        go_dur(round_ms(elapsed)),
                        e
                    );
                }
            }
            Ok(c) => {
                drop(c);
                successes += 1;
                total += elapsed;
                let lat = go_dur(round_ms(elapsed));
                let r = PingResult {
                    seq: i + 1,
                    success: true,
                    latency: lat.clone(),
                    error: String::new(),
                };
                if args.json {
                    results.push(r);
                } else {
                    println!(
                        "PING {} (port {}) — seq={} time={}",
                        args.host,
                        args.port,
                        i + 1,
                        lat
                    );
                }
            }
        }
    }

    if args.json {
        let avg = if successes > 0 {
            go_dur(round_ms(total / successes as u32))
        } else {
            "0s".to_string()
        };
        let out = serde_json::json!({
            "host": args.host,
            "port": args.port,
            "sent": count,
            "successes": successes,
            "failures": failures,
            "avg_ms": avg,
            "results": results,
        });
        println!("{}", serde_json::to_string_pretty(&out)?);
    } else {
        println!("\n--- {} ping statistics ---", args.host);
        println!(
            "{} sent, {} received, {:.0}% loss",
            count,
            successes,
            failures as f64 / count as f64 * 100.0
        );
        if successes > 0 {
            println!("avg time: {}", go_dur(round_ms(total / successes as u32)));
        }
    }
    Ok(())
}
