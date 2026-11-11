pub mod du;
pub mod env;
pub mod find;
pub mod ls;
pub mod ps;
pub mod psaux;
pub mod which;

use anyhow::Result;
use clap::{Args, Subcommand};

#[derive(Args)]
pub struct BetterArgs {
    #[command(subcommand)]
    pub command: Option<BetterCommand>,
    /// Output in JSON format
    #[arg(long, short = 'j', global = true)]
    pub json: bool,
}

#[derive(Subcommand)]
pub enum BetterCommand {
    /// Show disk usage by directory
    Du(du::DuArgs),
    /// Show environment variables in a clean table
    Env(env::EnvArgs),
    /// Recursively find files and directories
    Find(find::FindArgs),
    /// List directory contents
    Ls(ls::LsArgs),
    /// List processes in a clean table
    Ps(ps::PsArgs),
    /// All processes in a clean table (like ps aux)
    Psaux(psaux::PsauxArgs),
    /// Locate executable commands in PATH
    Which(which::WhichArgs),
}

pub fn run(args: &BetterArgs) -> Result<()> {
    match &args.command {
        Some(BetterCommand::Du(a)) => du::run(a, args.json),
        Some(BetterCommand::Env(a)) => env::run(a, args.json),
        Some(BetterCommand::Find(a)) => find::run(a, args.json),
        Some(BetterCommand::Ls(a)) => ls::run(a, args.json),
        Some(BetterCommand::Ps(a)) => ps::run(a, args.json),
        Some(BetterCommand::Psaux(a)) => psaux::run(a, args.json),
        Some(BetterCommand::Which(a)) => which::run(a, args.json),
        None => {
            // Cobra: RunE -> cmd.Help()
            println!("Improved versions of everyday Unix commands with table output, JSON formatting, and more options.\n");
            println!("Usage:\n  omni better [command]\n");
            println!("Available Commands:");
            println!("  du       Show disk usage by directory");
            println!("  env      Show environment variables in a clean table");
            println!("  find     Recursively find files and directories");
            println!("  ls       List directory contents");
            println!("  ps       List processes in a clean table");
            println!("  psaux    All processes in a clean table (like ps aux)");
            println!("  which    Locate executable commands in PATH");
            println!(
                "\nFlags:\n  -j, --json   Output in JSON format\n  -h, --help   help for better"
            );
            Ok(())
        }
    }
}

/// Shared table printer matching the Go `printTable` helpers.
pub(crate) fn print_table(headers: &[&str], rows: &[Vec<String>]) {
    let mut widths: Vec<usize> = headers.iter().map(|h| h.len()).collect();
    for row in rows {
        for (i, val) in row.iter().enumerate() {
            if val.len() > widths[i] {
                widths[i] = val.len();
            }
        }
    }
    for w in widths.iter_mut() {
        if *w < 3 {
            *w = 3;
        }
    }
    print_sep(&widths);
    print!("|");
    for (i, h) in headers.iter().enumerate() {
        print!(" {:<width$} |", h, width = widths[i]);
    }
    println!();
    print_sep(&widths);
    for row in rows {
        print!("|");
        for (i, val) in row.iter().enumerate() {
            print!(" {:<width$} |", val, width = widths[i]);
        }
        println!();
    }
    print_sep(&widths);
}

fn print_sep(widths: &[usize]) {
    print!("|");
    for w in widths {
        print!("{}|", "-".repeat(w + 2));
    }
    println!();
}

/// Go `humanSize`: floor(log1024) units B/K/M/G/T, "%.1f" above bytes.
pub(crate) fn human_size(bytes: i64) -> String {
    if bytes == 0 {
        return "0B".into();
    }
    let units = ["B", "K", "M", "G", "T"];
    let mut i = ((bytes as f64).ln() / (1024f64).ln()).floor() as usize;
    if i >= units.len() {
        i = units.len() - 1;
    }
    if i == 0 {
        return format!("{}B", bytes);
    }
    let val = bytes as f64 / 1024f64.powi(i as i32);
    format!("{val:.1}{}", units[i])
}
