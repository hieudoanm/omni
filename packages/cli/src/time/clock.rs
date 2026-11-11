use super::{rfc1123, rfc1123_utc};
use anyhow::Result;
use chrono::{Local, Utc};
use clap::{Args, Subcommand};

#[derive(Args)]
pub struct ClockArgs {
    #[command(subcommand)]
    pub command: Option<ClockCommand>,
}

#[derive(Subcommand)]
pub enum ClockCommand {
    /// Display current date and time
    Now(NowArgs),
}

#[derive(Args)]
pub struct NowArgs {
    /// Custom Go time format string
    #[arg(long, default_value = "")]
    pub format: String,
}

pub fn run(args: &ClockArgs, json: bool) -> Result<()> {
    match &args.command {
        Some(ClockCommand::Now(a)) => run_now(a, json),
        None => {
            let mut cmd = <ClockArgs as clap::Args>::augment_args(clap::Command::new("clock"));
            let _ = cmd.print_help();
            Ok(())
        }
    }
}

fn run_now(args: &NowArgs, json: bool) -> Result<()> {
    let now = Local::now();
    if json {
        // Go prints compact JSON: {"utc":"...","local":"...","unix":N}
        println!(
            "{{\"utc\":\"{}\",\"local\":\"{}\",\"unix\":{}}}",
            now.with_timezone(&Utc)
                .to_rfc3339_opts(chrono::SecondsFormat::Secs, true),
            now.to_rfc3339_opts(chrono::SecondsFormat::Secs, true),
            now.timestamp()
        );
        return Ok(());
    }
    if !args.format.is_empty() {
        println!("{}", now.format(&crate::timefmt::go_layout(&args.format)));
        return Ok(());
    }
    println!("Local: {}", rfc1123(&now));
    println!("UTC:   {}", rfc1123_utc(&now.with_timezone(&Utc)));
    println!("Unix:  {}", now.timestamp());
    Ok(())
}
