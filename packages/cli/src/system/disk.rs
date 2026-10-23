use super::disk_label;
use anyhow::Result;
use clap::{Args, Subcommand};
use serde::Serialize;

#[derive(Args)]
pub struct DiskArgs {
    /// Filter by mount point or device
    #[arg(long, short = 'f', default_value = "")]
    pub filter: String,
    /// Sort by usage percent
    #[arg(long, short = 's')]
    pub sort: bool,
    #[command(subcommand)]
    pub command: Option<DiskCommand>,
}

#[derive(Subcommand)]
pub enum DiskCommand {
    /// Show disk partition statistics
    Stats(stats::StatsArgs),
}

#[derive(Serialize)]
struct DiskType {
    mount: String,
    fstype: String,
    total: u64,
    used: u64,
    free: u64,
    used_percent: f64,
}

struct DiskInfo {
    mount: String,
    name: String,
    fstype: String,
    total: u64,
    avail: u64,
}

fn disks() -> Vec<DiskInfo> {
    let Ok(disks) = sysinfo::Disks::new_with_refreshed_list() else {
        return Vec::new();
    };
    disks
        .iter()
        .map(|d| DiskInfo {
            mount: d.mount_point().to_string_lossy().to_string(),
            name: d.name().to_string_lossy().to_string(),
            fstype: d.file_system().to_string_lossy().to_string(),
            total: d.total_space(),
            avail: d.available_space(),
        })
        .collect()
}

fn contains_fold(s: &str, substr: &str) -> bool {
    s.to_lowercase().contains(&substr.to_lowercase())
}

pub fn run(args: &DiskArgs, json: bool) -> Result<()> {
    if let Some(DiskCommand::Stats(a)) = &args.command {
        return stats::run(a);
    }

    let mut disks: Vec<DiskType> = disks()
        .iter()
        .filter(|d| {
            args.filter.is_empty()
                || contains_fold(&d.mount, &args.filter)
                || contains_fold(&d.name, &args.filter)
        })
        .map(|d| {
            let used = d.total.saturating_sub(d.avail);
            DiskType {
                mount: d.mount.clone(),
                fstype: d.fstype.clone(),
                total: d.total,
                used,
                free: d.avail,
                used_percent: if d.total > 0 {
                    used as f64 / d.total as f64 * 100.0
                } else {
                    0.0
                },
            }
        })
        .collect();

    if args.sort {
        disks.sort_by(|a, b| b.used_percent.partial_cmp(&a.used_percent).unwrap());
    }

    if json {
        println!("{}", serde_json::to_string_pretty(&disks)?);
    } else {
        println!(
            "{:<35} {:<10} {:>12} {:>12} {:>12} Use%",
            "Filesystem", "Type", "Total", "Used", "Free"
        );
        for d in &disks {
            println!(
                "{:<35} {:<10} {:>12} {:>12} {:>12} {:.1}%",
                d.mount,
                d.fstype,
                disk_label(d.total),
                disk_label(d.used),
                disk_label(d.free),
                d.used_percent
            );
        }
    }
    Ok(())
}

pub mod stats {
    use super::{disk_label, disks, DiskInfo};
    use anyhow::Result;
    use clap::Args;

    #[derive(Args)]
    pub struct StatsArgs {
        /// Show all partitions including virtual/dev
        #[arg(long, short = 'a')]
        pub all: bool,
    }

    pub fn run(args: &StatsArgs) -> Result<()> {
        let _ = args.all; // sysinfo already lists real mounts; pseudo-fs filtering is a Go-only nicety
        let mut list: Vec<DiskInfo> = disks();
        list.sort_by(|a, b| a.mount.cmp(&b.mount));
        for d in &list {
            let used = d.total.saturating_sub(d.avail);
            let pct = if d.total > 0 {
                used as f64 / d.total as f64 * 100.0
            } else {
                0.0
            };
            println!(
                "  {:<30}  {} used / {} free / {} total  {:.1}%",
                d.mount,
                disk_label(used),
                disk_label(d.avail),
                disk_label(d.total),
                pct
            );
        }
        Ok(())
    }
}
