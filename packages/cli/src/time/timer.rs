use anyhow::{anyhow, Result};
use clap::Args;
use std::sync::mpsc;
use std::time::{Duration, Instant};

#[derive(Args)]
pub struct TimerArgs {
    /// Duration (e.g., 30s, 5m, 2h, or bare number for seconds)
    #[arg(long, short = 'd', required = true)]
    pub duration: String,
}

fn parse_duration(s: &str) -> Result<Duration> {
    if s.is_empty() {
        return Err(anyhow!("duration is required"));
    }
    let (num_str, mult) = if let Some(rest) = s.strip_suffix('s') {
        (rest, 1u64)
    } else if let Some(rest) = s.strip_suffix('m') {
        (rest, 60)
    } else if let Some(rest) = s.strip_suffix('h') {
        (rest, 3600)
    } else {
        (s, 1)
    };
    let n: u64 = num_str
        .parse()
        .map_err(|_| anyhow!("invalid duration: {s}"))?;
    Ok(Duration::from_secs(n * mult))
}

fn fmt_mmss(d: Duration) -> String {
    let secs = d.as_secs();
    format!("{:02}:{:02}", secs / 60, secs % 60)
}

pub fn run(args: &TimerArgs, json: bool) -> Result<()> {
    let d = parse_duration(&args.duration)?;
    let (tx, rx) = mpsc::channel();
    let _ = ctrlc::set_handler(move || {
        let _ = tx.send(());
    });
    let start = Instant::now();
    match rx.recv_timeout(d) {
        Err(mpsc::RecvTimeoutError::Timeout) => {
            let elapsed = start.elapsed();
            if json {
                println!(
                    "{{\"status\":\"completed\",\"duration\":\"{}\",\"elapsed\":\"{}\"}}",
                    args.duration,
                    fmt_mmss(elapsed)
                );
            } else {
                println!("Time's up! (elapsed: {})", fmt_mmss(elapsed));
            }
        }
        _ => {
            let elapsed = start.elapsed();
            if json {
                println!(
                    "{{\"status\":\"cancelled\",\"elapsed\":\"{}\"}}",
                    fmt_mmss(elapsed)
                );
            } else {
                println!("\nTimer cancelled after {}", fmt_mmss(elapsed));
            }
        }
    }
    Ok(())
}
