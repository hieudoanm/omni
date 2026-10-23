pub mod battery;
pub mod clipboard;
pub mod disk;
pub mod env;
pub mod info;
pub mod monitor;
pub mod path;

use anyhow::Result;
use clap::{Args, Subcommand};

#[derive(Args)]
pub struct SystemArgs {
    #[command(subcommand)]
    pub command: Option<SystemCommand>,
    /// Output in JSON format
    #[arg(long, short = 'j', global = true)]
    pub json: bool,
}

#[derive(Subcommand)]
pub enum SystemCommand {
    /// Monitor system resources in real-time
    Monitor(monitor::MonitorArgs),
    /// Watch clipboard changes and store them in SQLite
    Clipboard(clipboard::ClipboardArgs),
    /// Show system information
    Info(info::InfoArgs),
    /// List or search environment variables
    Env(env::EnvArgs),
    /// List or search PATH directories and commands
    Path(path::PathArgs),
    /// Show disk usage for mounted filesystems
    Disk(disk::DiskArgs),
    /// Show battery status
    Battery(battery::BatteryArgs),
}

pub fn run(args: &SystemArgs) -> Result<()> {
    match &args.command {
        Some(SystemCommand::Monitor(a)) => monitor::run(a, args.json),
        Some(SystemCommand::Clipboard(a)) => clipboard::run(a, args.json),
        Some(SystemCommand::Info(a)) => info::run(a, args.json),
        Some(SystemCommand::Env(a)) => env::run(a, args.json),
        Some(SystemCommand::Path(a)) => path::run(a, args.json),
        Some(SystemCommand::Disk(a)) => disk::run(a, args.json),
        Some(SystemCommand::Battery(a)) => battery::run(a, args.json),
        None => {
            println!("System monitoring and clipboard management.\n");
            println!("Usage:\n  omni system [command]\n");
            println!("Available Commands:");
            println!("  battery    Show battery status");
            println!("  clipboard  Watch clipboard changes and store them in SQLite");
            println!("  disk       Show disk usage for mounted filesystems");
            println!("  env        List or search environment variables");
            println!("  info       Show system information");
            println!("  monitor    Monitor system resources in real-time");
            println!("  path       List or search PATH directories and commands");
            println!(
                "\nFlags:\n  -j, --json   Output in JSON format\n  -h, --help   help for system"
            );
            Ok(())
        }
    }
}

/// Go `internal.DiskLabel`: B then KB/MB/GB/TB/PB/EB at %.1f.
pub(crate) fn disk_label(bytes: u64) -> String {
    const UNIT: u64 = 1024;
    if bytes < UNIT {
        return format!("{bytes} B");
    }
    let mut div = UNIT;
    let mut exp = 0usize;
    let mut n = bytes / UNIT;
    while n >= UNIT {
        div *= UNIT;
        exp += 1;
        n /= UNIT;
    }
    let sizes = ["KB", "MB", "GB", "TB", "PB", "EB"];
    format!("{:.1} {}", bytes as f64 / div as f64, sizes[exp.min(5)])
}

/// Format seconds as a Go `time.Duration.String()` (e.g. "72h3m2s", "1m30s", "42s").
pub(crate) fn go_duration(secs: u64) -> String {
    let (h, m, s) = (secs / 3600, (secs % 3600) / 60, secs % 60);
    if h > 0 {
        format!("{h}h{m}m{s}s")
    } else if m > 0 {
        format!("{m}m{s}s")
    } else {
        format!("{s}s")
    }
}
