use anyhow::Result;
use clap::Args;

#[derive(Args)]
pub struct ToMp3Args {
    /// Input video file
    #[arg()]
    pub input: String,
    /// MP3 quality (VBR quality)
    #[arg(long, short = 'q', default_value_t = 4)]
    pub quality: i32,
    /// Output file path
    #[arg(long, short = 'o', default_value = "")]
    pub output: String,
}

pub fn run(args: &ToMp3Args) -> Result<()> {
    let out_path = if args.output.is_empty() {
        super::default_output(&args.input, ".mp3")
    } else {
        args.output.clone()
    };
    super::run_ffmpeg(
        "to-mp3",
        &[
            "-i".into(),
            args.input.clone(),
            "-vn".into(),
            "-acodec".into(),
            "libmp3lame".into(),
            "-aq".into(),
            args.quality.to_string(),
            "-y".into(),
            out_path.clone(),
        ],
    )?;
    println!("converted {} -> {}", args.input, out_path);
    Ok(())
}
