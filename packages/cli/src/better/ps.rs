use super::{human_size, print_table};
use anyhow::Result;
use clap::Args;
use serde::Serialize;
use std::process::Command;

#[derive(Args)]
pub struct PsArgs {
    /// Show processes from all users
    #[arg(long, short = 'a')]
    pub all: bool,
    /// Sort column: pid, cpu, mem
    #[arg(long, short = 's', default_value = "pid")]
    pub sort: String,
    /// Long format with PPID, RSS, VSZ, STAT
    #[arg(long, short = 'l')]
    pub long: bool,
    /// Human-readable RSS/VSZ (requires --long)
    #[arg(long, short = 'H')]
    pub human: bool,
}

#[derive(Serialize)]
struct ProcEntry {
    pid: i64,
    #[serde(skip_serializing_if = "is_zero")]
    ppid: i64,
    cpu: f64,
    mem: f64,
    #[serde(skip_serializing_if = "is_zero")]
    rss: i64,
    #[serde(skip_serializing_if = "is_zero")]
    vsz: i64,
    #[serde(skip_serializing_if = "String::is_empty")]
    stat: String,
    comm: String,
}

fn is_zero(v: &i64) -> bool {
    *v == 0
}

pub fn run(args: &PsArgs, json: bool) -> Result<()> {
    let format = "pid,ppid,pcpu,pmem,rss,vsz,stat,comm";
    let mut cmd = Command::new("ps");
    if args.all {
        cmd.args(["-Ao", format]);
    } else {
        cmd.args(["-o", format]);
    }
    match args.sort.as_str() {
        "cpu" => {
            cmd.arg("-r");
        }
        "mem" => {
            cmd.arg("-m");
        }
        _ => {}
    }
    let out = cmd
        .output()
        .map_err(|e| anyhow::anyhow!("ps failed: {e}"))?;
    let stdout = String::from_utf8_lossy(&out.stdout);
    let lines: Vec<&str> = stdout.trim().lines().collect();
    if lines.len() < 2 {
        return Ok(());
    }

    let mut results: Vec<ProcEntry> = Vec::new();
    for line in &lines[1..] {
        let fields = split_ps_line(line);
        if fields.len() < 8 {
            continue;
        }
        results.push(ProcEntry {
            pid: fields[0].parse().unwrap_or(0),
            ppid: fields[1].parse().unwrap_or(0),
            cpu: fields[2].parse().unwrap_or(0.0),
            mem: fields[3].parse().unwrap_or(0.0),
            rss: fields[4].parse().unwrap_or(0),
            vsz: fields[5].parse().unwrap_or(0),
            stat: fields[6].clone(),
            comm: fields[7].clone(),
        });
    }

    match args.sort.as_str() {
        "cpu" => results.sort_by(|a, b| b.cpu.partial_cmp(&a.cpu).unwrap()),
        "mem" => results.sort_by(|a, b| b.mem.partial_cmp(&a.mem).unwrap()),
        _ => results.sort_by_key(|p| p.pid),
    }

    if json {
        println!(
            "{}",
            serde_json::to_string_pretty(&serde_json::json!({
                "processes": results,
                "count": results.len(),
            }))?
        );
        return Ok(());
    }

    if args.long {
        return output_long(&results, args.human);
    }
    output_short(&results);
    Ok(())
}

fn split_ps_line(line: &str) -> Vec<String> {
    let parts: Vec<&str> = line.split_whitespace().collect();
    if parts.len() >= 8 {
        let mut fields: Vec<String> = parts[..8].iter().map(|s| s.to_string()).collect();
        fields[7] = parts[7..].join(" ");
        fields
    } else {
        Vec::new()
    }
}

fn output_short(results: &[ProcEntry]) {
    let rows: Vec<Vec<String>> = results
        .iter()
        .map(|p| {
            vec![
                p.pid.to_string(),
                format!("{:.1}", p.cpu),
                format!("{:.1}", p.mem),
                p.comm.clone(),
            ]
        })
        .collect();
    print_table(&["PID", "CPU%", "MEM%", "COMMAND"], &rows);
}

fn output_long(results: &[ProcEntry], human: bool) -> Result<()> {
    let size_header = if human { "RSS" } else { "RSS (KB)" };
    let mut rows = Vec::with_capacity(results.len());
    for p in results {
        let (rss, vsz) = if human {
            (human_size(p.rss * 1024), human_size(p.vsz * 1024))
        } else {
            (p.rss.to_string(), p.vsz.to_string())
        };
        rows.push(vec![
            p.pid.to_string(),
            p.ppid.to_string(),
            format!("{:.1}", p.cpu),
            format!("{:.1}", p.mem),
            rss,
            vsz,
            p.stat.clone(),
            p.comm.clone(),
        ]);
    }
    print_table(
        &[
            "PID",
            "PPID",
            "CPU%",
            "MEM%",
            size_header,
            "VSZ (KB)",
            "STAT",
            "COMMAND",
        ],
        &rows,
    );
    Ok(())
}
