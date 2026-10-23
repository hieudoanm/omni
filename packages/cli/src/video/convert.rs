use anyhow::Result;
use clap::Args;

#[derive(Args)]
pub struct ConvertArgs {
    /// Input video file
    #[arg()]
    pub input: String,
    /// Output format (mp4, mov, mkv, avi, webm, gif)
    #[arg(long, short = 'f', default_value = "mp4")]
    pub format: String,
    /// Output file path
    #[arg(long, short = 'o', default_value = "")]
    pub output: String,
}

pub fn run(args: &ConvertArgs) -> Result<()> {
    let out_fmt = if args.format.is_empty() {
        "mp4"
    } else {
        &args.format
    };
    let out_path = if args.output.is_empty() {
        super::default_output(&args.input, &format!(".{out_fmt}"))
    } else {
        args.output.clone()
    };
    super::run_ffmpeg(
        "convert",
        &[
            "-i".into(),
            args.input.clone(),
            "-y".into(),
            out_path.clone(),
        ],
    )?;
    println!("converted {} -> {}", args.input, out_path);
    Ok(())
}
