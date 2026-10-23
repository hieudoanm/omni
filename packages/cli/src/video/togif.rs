use anyhow::Result;
use clap::Args;

#[derive(Args)]
pub struct ToGifArgs {
    /// Input video file
    #[arg()]
    pub input: String,
    /// Frames per second
    #[arg(long, short = 'r', default_value_t = 10)]
    pub fps: i32,
    /// Output width in pixels
    #[arg(long, short = 'w', default_value_t = 480)]
    pub width: i32,
    /// Output file path
    #[arg(long, short = 'o', default_value = "")]
    pub output: String,
}

pub fn run(args: &ToGifArgs) -> Result<()> {
    let out_path = if args.output.is_empty() {
        super::default_output(&args.input, ".gif")
    } else {
        args.output.clone()
    };
    let vf = format!("fps={},scale={}:-1:flags=lanczos", args.fps, args.width);
    super::run_ffmpeg(
        "to-gif",
        &[
            "-i".into(),
            args.input.clone(),
            "-vf".into(),
            vf,
            "-y".into(),
            out_path.clone(),
        ],
    )?;
    println!("converted {} -> {}", args.input, out_path);
    Ok(())
}
