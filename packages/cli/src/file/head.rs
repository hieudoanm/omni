use anyhow::Result;
use clap::Args;

#[derive(Args)]
pub struct HeadArgs {
    /// File path
    #[arg(long, short = 'f', default_value = "")]
    pub file: String,
    /// Number of lines
    #[arg(long, short = 'n', default_value_t = 10)]
    pub lines: usize,
}

pub fn run(args: &HeadArgs, json: bool) -> Result<()> {
    let data = std::fs::read(&args.file)?;
    let text = String::from_utf8_lossy(&data);
    let mut all: Vec<&str> = text.split('\n').collect();
    if text.is_empty() {
        all.clear();
    } else if text.ends_with('\n') {
        all.pop();
    }
    let out_lines: Vec<String> = all
        .iter()
        .take(args.lines)
        .map(|l| l.trim_end_matches('\r').to_string())
        .collect();

    if json {
        println!(
            "{}",
            serde_json::to_string_pretty(
                &serde_json::json!({"file": args.file, "lines": out_lines})
            )?
        );
    } else {
        for l in &out_lines {
            println!("{l}");
        }
    }
    Ok(())
}
