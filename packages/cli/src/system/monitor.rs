use super::go_duration;
use anyhow::Result;
use clap::Args;
use serde::Serialize;
use std::time::Duration;

#[derive(Args)]
pub struct MonitorArgs {}

#[derive(Serialize)]
struct ProcInfo {
    pid: u32,
    name: String,
    #[serde(rename = "cpu_percent")]
    cpu: f64,
    #[serde(rename = "mem_mb")]
    mem_mb: u64,
}

pub fn run(_args: &MonitorArgs, json: bool) -> Result<()> {
    if json {
        return monitor_json();
    }
    let (tx, rx) = std::sync::mpsc::channel::<Result<Metrics>>();
    crate::tui::run(MonitorApp {
        tx,
        rx,
        pending: false,
        metrics: None,
        err: None,
    })
    .map_err(|e| anyhow::anyhow!("{e}"))?;
    Ok(())
}

struct MonitorApp {
    tx: std::sync::mpsc::Sender<Result<Metrics>>,
    rx: std::sync::mpsc::Receiver<Result<Metrics>>,
    pending: bool,
    metrics: Option<Metrics>,
    err: Option<String>,
}

impl crate::tui::TuiApp for MonitorApp {
    fn draw(&mut self, frame: &mut ratatui::Frame) {
        use ratatui::layout::Alignment;
        use ratatui::style::{Color, Modifier, Style};
        use ratatui::text::{Line, Span};
        use ratatui::widgets::Paragraph;

        let area = frame.area();
        let mut lines = Vec::new();
        if let Some(e) = &self.err {
            lines.push(Line::from(Span::styled(
                format!("error: {e}"),
                Style::default().fg(Color::Red),
            )));
        } else if let Some(m) = &self.metrics {
            lines.push(Line::from(Span::styled(
                "SYSTEM MONITOR",
                Style::default()
                    .fg(Color::White)
                    .add_modifier(Modifier::BOLD),
            )));
            lines.push(Line::from(""));
            lines.push(Line::from(format!("CPU: {:.1}%", m.cpu_total)));
            lines.push(Line::from(format!("RAM: {:.1}%", m.ram_pct)));
            lines.push(Line::from(format!("Uptime: {}", go_duration(m.uptime))));
            lines.push(Line::from(""));
            lines.push(Line::from(Span::styled(
                "Press q to quit",
                Style::default().fg(Color::DarkGray),
            )));
        } else {
            lines.push(Line::from(Span::styled(
                "Gathering metrics...",
                Style::default().fg(Color::DarkGray),
            )));
        }
        frame.render_widget(
            Paragraph::new(lines).alignment(Alignment::Left),
            ratatui::layout::Rect::new(2, 1, area.width.saturating_sub(4), area.height),
        );
    }

    fn handle(&mut self, ev: crate::tui::AppEvent) -> bool {
        use crate::tui::AppEvent;
        match ev {
            AppEvent::Key(k) => {
                if let Some(name) = crate::tui::key_name(&k) {
                    if name == "q" || name == "ctrl+c" {
                        return true;
                    }
                }
            }
            AppEvent::Tick => {
                while let Ok(res) = self.rx.try_recv() {
                    self.pending = false;
                    match res {
                        Ok(m) => self.metrics = Some(m),
                        Err(e) => self.err = Some(e.to_string()),
                    }
                }
                if !self.pending {
                    self.pending = true;
                    let tx = self.tx.clone();
                    std::thread::spawn(move || {
                        let _ = tx.send(gather());
                    });
                }
            }
            _ => {}
        }
        false
    }

    fn tick_interval(&self) -> Option<std::time::Duration> {
        Some(std::time::Duration::from_secs(1))
    }
}

struct Metrics {
    cpu_total: f64,
    ram_pct: f64,
    ram_used_gb: f64,
    ram_total_gb: f64,
    uptime: u64,
    top_procs: Vec<Proc>,
}

struct Proc {
    pid: u32,
    name: String,
    cpu: f64,
    mem_mb: u64,
}

fn gather() -> Result<Metrics> {
    let mut sys = sysinfo::System::new_all()?;
    sys.refresh_cpu_all();
    sys.refresh_memory();
    sys.refresh_processes(sysinfo::ProcessesToUpdate::All, true);
    // CPU% needs a second sample; refresh again after a short interval.
    std::thread::sleep(Duration::from_millis(200));
    sys.refresh_cpu_all();
    sys.refresh_processes(sysinfo::ProcessesToUpdate::All, true);

    let cpu_total = sys.global_cpu_usage() as f64;
    let ram_total = sys.total_memory() as f64;
    let ram_used = sys.used_memory() as f64;
    let ram_pct = if ram_total > 0.0 {
        ram_used / ram_total * 100.0
    } else {
        0.0
    };

    let mut procs: Vec<Proc> = sys
        .processes()
        .values()
        .map(|p| Proc {
            pid: p.pid().as_u32(),
            name: p.name().to_string_lossy().to_string(),
            cpu: p.cpu_usage() as f64,
            mem_mb: p.memory() / (1024 * 1024),
        })
        .collect();
    procs.sort_by(|a, b| b.cpu.partial_cmp(&a.cpu).unwrap());
    procs.truncate(10);

    Ok(Metrics {
        cpu_total,
        ram_pct,
        ram_used_gb: ram_used / 1e9,
        ram_total_gb: ram_total / 1e9,
        uptime: sysinfo::System::uptime().unwrap_or(0),
        top_procs: procs,
    })
}

fn monitor_json() -> Result<()> {
    let m = gather()?;
    let procs: Vec<ProcInfo> = m
        .top_procs
        .iter()
        .map(|p| ProcInfo {
            pid: p.pid,
            name: p.name.clone(),
            cpu: p.cpu,
            mem_mb: p.mem_mb,
        })
        .collect();
    println!(
        "{}",
        serde_json::to_string_pretty(&serde_json::json!({
            "cpu_percent": m.cpu_total,
            "ram_percent": m.ram_pct,
            "ram_used_gb": m.ram_used_gb,
            "ram_total_gb": m.ram_total_gb,
            "uptime": go_duration(m.uptime),
            "top_processes": procs,
        }))?
    );
    Ok(())
}
