use crate::history as hist;
use anyhow::Result;
use clap::{Args as ClapArgs, Subcommand};

#[derive(ClapArgs)]
#[command(
    about = "Command execution history",
    long_about = "View and manage CLI and MCP command execution history."
)]
pub struct HistoryArgs {
    #[command(subcommand)]
    pub command: Option<HistoryCommand>,
    /// Output in JSON format
    #[arg(long, short = 'j', global = true)]
    pub json: bool,
}

#[derive(Subcommand)]
pub enum HistoryCommand {
    /// List recent history entries
    List(ListArgs),
    /// Search history entries
    Search(SearchArgs),
    /// Clear all history
    Clear,
    /// Show history statistics
    Stats,
}

#[derive(clap::Args)]
pub struct ListArgs {
    /// Max entries to show
    #[arg(long, short = 'n', default_value_t = 20)]
    pub limit: i64,
}

#[derive(clap::Args)]
pub struct SearchArgs {
    /// Search query
    #[arg()]
    pub query: String,
    /// Max entries to show
    #[arg(long, short = 'n', default_value_t = 20)]
    pub limit: i64,
}

fn print_entries(entries: &[hist::Entry], json: bool, empty_msg: &str) -> Result<()> {
    if entries.is_empty() {
        if json {
            println!("[]");
        } else {
            eprintln!("{empty_msg}");
        }
        return Ok(());
    }
    if json {
        println!("{}", serde_json::to_string(entries)?);
    } else {
        for e in entries {
            println!("{e}");
        }
    }
    Ok(())
}

pub fn run(args: &HistoryArgs) -> Result<()> {
    let Some(command) = &args.command else {
        let mut cmd = <HistoryArgs as ClapArgs>::augment_args(clap::Command::new("history"));
        let _ = cmd.print_help();
        return Ok(());
    };
    match command {
        HistoryCommand::List(a) => {
            print_entries(&hist::list(a.limit)?, args.json, "no history entries")
        }
        HistoryCommand::Search(a) => print_entries(
            &hist::search(&a.query, a.limit)?,
            args.json,
            "no matching entries",
        ),
        HistoryCommand::Clear => {
            hist::clear()?;
            if args.json {
                println!(r#"{{"status":"cleared"}}"#);
            } else {
                println!("history cleared");
            }
            Ok(())
        }
        HistoryCommand::Stats => {
            let stats = hist::compute_stats()?;
            if args.json {
                println!("{}", serde_json::to_string(&stats)?);
                return Ok(());
            }
            println!("CLI commands:  {}", stats.total_cli);
            println!("MCP tool calls: {}", stats.total_mcp);
            println!();
            if !stats.top_commands.is_empty() {
                println!("Top commands:");
                for cc in &stats.top_commands {
                    println!("  {:5}  {}", cc.count, cc.name);
                }
            }
            if !stats.top_errors.is_empty() {
                println!();
                println!("Top errors:");
                for cc in &stats.top_errors {
                    println!("  {:5}  {}", cc.count, cc.name);
                }
            }
            Ok(())
        }
    }
}
