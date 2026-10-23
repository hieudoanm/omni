use super::go_duration;
use anyhow::Result;
use clap::Args;
use serde::Serialize;
use std::process::Command;

#[derive(Args)]
pub struct InfoArgs {}

#[derive(Serialize)]
struct SysInfo {
    hostname: String,
    os: String,
    arch: String,
    cpu_count: usize,
    uptime: String,
    memory: String,
}

pub fn run(_args: &InfoArgs, json: bool) -> Result<()> {
    let info = SysInfo {
        hostname: hostname(),
        os: std::env::consts::OS.to_string(),
        arch: std::env::consts::ARCH.to_string(),
        cpu_count: std::thread::available_parallelism()
            .map(|n| n.get())
            .unwrap_or(0),
        uptime: uptime(),
        memory: total_memory(),
    };

    if json {
        println!("{}", serde_json::to_string_pretty(&info)?);
    } else {
        println!("Hostname: {}", info.hostname);
        println!("OS:       {}", info.os);
        println!("Arch:     {}", info.arch);
        println!("CPU:      {} cores", info.cpu_count);
        println!("Uptime:   {}", info.uptime);
        println!("Memory:   {}", info.memory);
    }
    Ok(())
}

fn hostname() -> String {
    sysinfo::System::host_name().unwrap_or_else(|_| "unknown".into())
}

fn uptime() -> String {
    match std::env::consts::OS {
        "macos" => {
            // Go: sysctl -n kern.boottime -> "sec = <epoch>,usec = ..."
            let out = Command::new("sysctl")
                .args(["-n", "kern.boottime"])
                .output();
            let Ok(out) = out else {
                return "unknown".into();
            };
            let text = String::from_utf8_lossy(&out.stdout);
            for f in text.split_whitespace() {
                let f = f.trim_end_matches(',');
                if let Ok(sec) = f.parse::<i64>() {
                    let boot = chrono::DateTime::from_timestamp(sec, 0).unwrap_or_default();
                    let d = chrono::Utc::now() - boot;
                    let secs = d.num_seconds().max(0) as u64;
                    return go_duration(secs);
                }
            }
            "unknown".into()
        }
        "linux" => {
            if let Ok(data) = std::fs::read_to_string("/proc/uptime") {
                if let Some(first) = data.split_whitespace().next() {
                    if let Ok(sec) = first.parse::<f64>() {
                        return go_duration(sec.round() as u64);
                    }
                }
            }
            "unknown".into()
        }
        _ => "unknown".into(),
    }
}

fn total_memory() -> String {
    let total = sysinfo::System::new()
        .map(|mut sys| {
            sys.refresh_memory();
            sys.total_memory()
        })
        .unwrap_or(0);
    if total > 0 {
        return format_memory(total);
    }
    // Fallbacks matching the Go sysctl//proc paths.
    match std::env::consts::OS {
        "macos" => {
            if let Ok(out) = Command::new("sysctl").args(["-n", "hw.memsize"]).output() {
                if let Ok(b) = String::from_utf8_lossy(&out.stdout).trim().parse::<u64>() {
                    return format_memory(b);
                }
            }
        }
        "linux" => {
            if let Ok(data) = std::fs::read_to_string("/proc/meminfo") {
                for line in data.lines() {
                    if let Some(rest) = line.strip_prefix("MemTotal:") {
                        if let Some(kb) = rest.split_whitespace().next() {
                            if let Ok(v) = kb.parse::<u64>() {
                                return format_memory(v * 1024);
                            }
                        }
                    }
                }
            }
        }
        _ => {}
    }
    "unknown".into()
}

/// Go `formatBytes`: %.1f KB/MB/GB/TB.
fn format_memory(b: u64) -> String {
    const UNIT: u64 = 1024;
    if b < UNIT {
        return format!("{b} B");
    }
    let mut div = UNIT;
    let mut exp = 0usize;
    let mut n = b / UNIT;
    while n >= UNIT {
        div *= UNIT;
        exp += 1;
        n /= UNIT;
    }
    let sizes = ["KB", "MB", "GB", "TB"];
    format!("{:.1} {}", b as f64 / div as f64, sizes[exp.min(3)])
}
