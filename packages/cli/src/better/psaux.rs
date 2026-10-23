use super::print_table;
use anyhow::Result;
use clap::Args;
use serde::Serialize;
use std::process::Command;

#[derive(Args)]
pub struct PsauxArgs {
    /// Sort column: pid, cpu, mem, user
    #[arg(long, short = 's', default_value = "pid")]
    pub sort: String,
    /// Filter by user name
    #[arg(long, short = 'u', default_value = "")]
    pub user: String,
}

#[derive(Serialize)]
struct PsauxEntry {
    user: String,
    pid: i64,
    cpu: f64,
    mem: f64,
    rss: i64,
    vsz: i64,
    tty: String,
    stat: String,
    started: String,
    time: String,
    comm: String,
}

pub fn run(args: &PsauxArgs, json: bool) -> Result<()> {
    let format = "user,pid,pcpu,pmem,rss,vsz,tty,stat,lstart,time,comm";
    let out = Command::new("ps")
        .args(["-Ao", format])
        .output()
        .map_err(|e| anyhow::anyhow!("ps failed: {e}"))?;
    let stdout = String::from_utf8_lossy(&out.stdout);
    let lines: Vec<&str> = stdout.trim().lines().collect();
    if lines.len() < 2 {
        return Ok(());
    }

    let mut results: Vec<PsauxEntry> = Vec::new();
    for line in &lines[1..] {
        let fields = split_line(line);
        if fields.len() < 11 {
            continue;
        }
        let entry = PsauxEntry {
            user: fields[0].clone(),
            pid: fields[1].parse().unwrap_or(0),
            cpu: fields[2].parse().unwrap_or(0.0),
            mem: fields[3].parse().unwrap_or(0.0),
            rss: fields[4].parse().unwrap_or(0),
            vsz: fields[5].parse().unwrap_or(0),
            tty: fields[6].clone(),
            stat: fields[7].clone(),
            started: fields[8].clone(),
            time: fields[9].clone(),
            comm: fields[10].clone(),
        };
        if !args.user.is_empty() && !entry.user.eq_ignore_ascii_case(&args.user) {
            continue;
        }
        results.push(entry);
    }

    match args.sort.as_str() {
        "cpu" => results.sort_by(|a, b| b.cpu.partial_cmp(&a.cpu).unwrap()),
        "mem" => results.sort_by(|a, b| b.mem.partial_cmp(&a.mem).unwrap()),
        "user" => results.sort_by_key(|p| p.user.to_lowercase()),
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

    let rows: Vec<Vec<String>> = results
        .iter()
        .map(|p| {
            vec![
                p.user.clone(),
                p.pid.to_string(),
                format!("{:.1}", p.cpu),
                format!("{:.1}", p.mem),
                p.rss.to_string(),
                p.vsz.to_string(),
                p.stat.clone(),
                p.time.clone(),
                p.comm.clone(),
            ]
        })
        .collect();
    print_table(
        &[
            "USER", "PID", "CPU%", "MEM%", "RSS (KB)", "VSZ (KB)", "STAT", "TIME", "COMMAND",
        ],
        &rows,
    );
    Ok(())
}

fn split_line(line: &str) -> Vec<String> {
    let parts: Vec<&str> = line.split_whitespace().collect();
    if parts.len() >= 11 {
        let mut fields: Vec<String> = parts[..11].iter().map(|s| s.to_string()).collect();
        fields[10] = parts[10..].join(" ");
        fields
    } else {
        Vec::new()
    }
}
