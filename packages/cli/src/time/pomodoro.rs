use anyhow::Result;
use clap::Args;
use std::sync::mpsc;
use std::time::Duration;

#[derive(Args)]
pub struct PomodoroArgs {
    /// Work duration in minutes
    #[arg(long, default_value_t = 25)]
    pub work: i64,
    /// Rest duration in minutes
    #[arg(long, default_value_t = 5)]
    pub rest: i64,
}

fn ctrlc_channel() -> mpsc::Receiver<()> {
    let (tx, rx) = mpsc::channel();
    // Set once per process; only one interactive command runs per invocation.
    let _ = ctrlc::set_handler(move || {
        let _ = tx.send(());
    });
    rx
}

pub fn run(args: &PomodoroArgs) -> Result<()> {
    println!(
        "Launching Pomodoro ({} min work, {} min rest)",
        args.work, args.rest
    );
    let rx = ctrlc_channel();
    let work_dur = Duration::from_secs(args.work.max(0) as u64 * 60);
    let rest_dur = Duration::from_secs(args.rest.max(0) as u64 * 60);

    loop {
        print!("\rWork interval (Ctrl+C to quit)...");
        let _ = std::io::Write::flush(&mut std::io::stdout());
        match rx.recv_timeout(work_dur) {
            Err(mpsc::RecvTimeoutError::Timeout) => {}
            _ => {
                println!("\nPomodoro session ended.");
                return Ok(());
            }
        }
        print!("\rRest interval...       ");
        let _ = std::io::Write::flush(&mut std::io::stdout());
        match rx.recv_timeout(rest_dur) {
            Err(mpsc::RecvTimeoutError::Timeout) => {}
            _ => {
                println!("\nPomodoro session ended.");
                return Ok(());
            }
        }
    }
}
