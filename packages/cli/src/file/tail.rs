use anyhow::Result;
use clap::Args;

#[derive(Args)]
pub struct TailArgs {
    /// File path
    #[arg(long, short = 'f', default_value = "")]
    pub file: String,
    /// Number of lines
    #[arg(long, short = 'n', default_value_t = 10)]
    pub lines: usize,
}

pub fn run(args: &TailArgs, json: bool) -> Result<()> {
    let data = std::fs::read(&args.file)?;
    let text = String::from_utf8_lossy(&data);
    let mut all: Vec<&str> = text.split('\n').collect();
    if text.is_empty() {
        all.clear();
    } else if text.ends_with('\n') {
        all.pop();
    }
    let ring: Vec<String> = all
        .iter()
        .rev()
        .take(args.lines)
        .rev()
        .map(|l| l.trim_end_matches('\r').to_string())
        .collect();

    if json {
        println!(
            "{}",
            serde_json::to_string_pretty(&serde_json::json!({"file": args.file, "lines": ring}))?
        );
    } else {
        for l in &ring {
            println!("{l}");
        }
    }
    Ok(())
}
