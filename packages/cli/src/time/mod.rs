use anyhow::Result;
use chrono::{DateTime, Local, SecondsFormat, Utc};
use clap::{Args, Subcommand};

#[derive(Args)]
#[command(
    about = "Current time, pomodoro timer, countdown timer, epoch conversion, and cron expression utilities."
)]
pub struct TimeArgs {
    #[command(subcommand)]
    pub command: Option<TimeCommand>,
    /// Output in JSON format
    #[arg(long, short = 'j', global = true)]
    pub json: bool,
}

#[derive(Subcommand)]
pub enum TimeCommand {
    /// Current time utilities
    Clock(clock::ClockArgs),
    /// Describe a cron expression in plain English and compute next runs
    Cron(cron::CronArgs),
    /// Convert between epoch timestamps and human-readable dates
    Epoch(epoch::EpochArgs),
    /// Start a Pomodoro timer session
    Pomodoro(pomodoro::PomodoroArgs),
    /// Simple countdown timer
    Timer(timer::TimerArgs),
    /// Countdown to a specific date/time
    Until(until::UntilArgs),
    /// Display current time in multiple timezones
    World(world::WorldArgs),
    /// Calculate age from a birthdate
    Age(age::AgeArgs),
    /// Measure elapsed time like a stopwatch
    Stopwatch(stopwatch::StopwatchArgs),
}

pub mod age;
pub mod clock;
pub mod cron;
pub mod epoch;
pub mod internal;
pub mod pomodoro;
pub mod stopwatch;
pub mod timer;
pub mod until;
pub mod world;

pub fn run(args: &TimeArgs) -> Result<()> {
    let Some(command) = &args.command else {
        let mut cmd = <TimeArgs as clap::Args>::augment_args(clap::Command::new("time"));
        let _ = cmd.print_help();
        return Ok(());
    };
    let j = args.json;
    match command {
        TimeCommand::Clock(a) => clock::run(a, j),
        TimeCommand::Cron(a) => cron::run(a, j),
        TimeCommand::Epoch(a) => epoch::run(a, j),
        TimeCommand::Pomodoro(a) => pomodoro::run(a),
        TimeCommand::Timer(a) => timer::run(a, j),
        TimeCommand::Until(a) => until::run(a),
        TimeCommand::World(a) => world::run(a),
        TimeCommand::Age(a) => age::run(a, j),
        TimeCommand::Stopwatch(a) => stopwatch::run(a, j),
    }
}

/// Go time.RFC1123 rendering: "Mon, 02 Jan 2006 15:04:05 MST".
pub fn rfc1123(dt: &DateTime<Local>) -> String {
    dt.format("%a, %d %b %Y %H:%M:%S %Z").to_string()
}

pub fn rfc1123_utc(dt: &DateTime<Utc>) -> String {
    dt.format("%a, %d %b %Y %H:%M:%S %Z").to_string()
}

pub fn rfc3339(dt: &DateTime<Utc>) -> String {
    dt.to_rfc3339_opts(SecondsFormat::Secs, true)
}

/// Go stopwatch/timer duration format: HH:MM:SS.
pub fn print_elapsed_hms(secs: u64) -> String {
    format!(
        "{:02}:{:02}:{:02}",
        secs / 3600,
        (secs % 3600) / 60,
        secs % 60
    )
}
