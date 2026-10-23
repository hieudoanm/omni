use super::{internal, transcript};
use anyhow::Result;
use clap::Args;
use serde_json::json;

#[derive(Args)]
pub struct FetchArgs {
    /// Video URL or ID
    #[arg(long, short = 'u', default_value = "")]
    pub url: String,
    /// Language code (e.g. en, es, fr)
    #[arg(long, short = 'l', default_value = "en")]
    pub lang: String,
    /// Save to file instead of stdout
    #[arg(long, short = 'o', default_value = "")]
    pub output: String,
    /// Output format: text or json
    #[arg(long, short = 'f', default_value = "text")]
    pub format: String,
    /// Omit timestamps from text output
    #[arg(long)]
    pub no_timestamps: bool,
    /// Output in JSON format
    #[arg(long)]
    pub json: bool,
}

pub fn run(args: &FetchArgs) -> Result<()> {
    let video_id = internal::extract(&args.url)?;
    let t = transcript::fetch(&video_id, &args.lang)?;

    let out = if args.json || args.format.eq_ignore_ascii_case("json") {
        if args.json {
            serde_json::to_string_pretty(&json!({
                "videoId": video_id,
                "language": t.language,
                "kind": t.kind,
                "lines": t.lines,
            }))?
        } else {
            serde_json::to_string_pretty(&t)?
        }
    } else {
        let mut sb = String::new();
        for line in &t.lines {
            if args.no_timestamps {
                sb.push_str(&format!("{}\n", line.text));
            } else {
                sb.push_str(&format!("[{:6.2}s] {}\n", line.start, line.text));
            }
        }
        sb
    };

    if !args.output.is_empty() {
        std::fs::write(&args.output, out)?;
        return Ok(());
    }
    if args.json {
        println!("{out}");
    } else {
        eprintln!("✓ {video_id} ({}, {})", t.language, t.kind);
        print!("{out}");
    }
    Ok(())
}
