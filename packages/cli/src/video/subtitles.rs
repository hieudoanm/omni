use anyhow::{anyhow, Result};
use clap::Args;

#[derive(Args)]
pub struct SubtitlesArgs {
    /// Input video file
    #[arg()]
    pub input: String,
    /// Action: extract or burn
    #[arg(long, short = 'a', default_value = "extract")]
    pub action: String,
    /// Language code for subtitles
    #[arg(long, short = 'l', default_value = "")]
    pub lang: String,
    /// Output file path
    #[arg(long, short = 'o', default_value = "")]
    pub output: String,
}

pub fn run(args: &SubtitlesArgs) -> Result<()> {
    let _ = args.lang;
    let out_path = if args.output.is_empty() {
        let suffix = if args.action == "burn" {
            "_subbed.mp4"
        } else {
            "_subtitles.srt"
        };
        super::default_output(&args.input, suffix)
    } else {
        args.output.clone()
    };
    let ffargs: Vec<String> = match args.action.as_str() {
        "extract" => vec![
            "-i".into(),
            args.input.clone(),
            "-map".into(),
            "0:s:0".into(),
            "-y".into(),
            out_path.clone(),
        ],
        "burn" => {
            let sub_file = if args.output.is_empty() {
                super::default_output(&args.input, "_subtitles.srt")
            } else {
                args.output.clone()
            };
            vec![
                "-i".into(),
                args.input.clone(),
                "-vf".into(),
                format!("subtitles={sub_file}"),
                "-y".into(),
                out_path.clone(),
            ]
        }
        a => {
            return Err(anyhow!(
                "video subtitles: unknown action {a:?}, use 'extract' or 'burn'"
            ))
        }
    };
    super::run_ffmpeg("subtitles", &ffargs)?;
    println!("{} {} -> {}", args.action, args.input, out_path);
    Ok(())
}
