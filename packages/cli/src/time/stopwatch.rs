use super::print_elapsed_hms;
use anyhow::Result;
use clap::Args;
use std::sync::mpsc;
use std::time::Instant;

#[derive(Args)]
pub struct StopwatchArgs {}

pub fn run(_args: &StopwatchArgs, json: bool) -> Result<()> {
    let (tx, rx) = mpsc::channel();
    let _ = ctrlc::set_handler(move || {
        let _ = tx.send(());
    });
    let start = Instant::now();
    println!("Stopwatch started (Ctrl+C to stop)...");
    let _ = rx.recv();
    let elapsed = start.elapsed();
    if json {
        println!(
            "{{\"elapsed\":\"{}\"}}",
            print_elapsed_hms(elapsed.as_secs())
        );
    } else {
        println!("Elapsed: {}", print_elapsed_hms(elapsed.as_secs()));
    }
    Ok(())
}
