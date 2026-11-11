use anyhow::Result;
use clap::Args;

#[derive(Args)]
pub struct ResizeArgs {
    /// Input video file
    #[arg()]
    pub input: String,
    /// Target width (-1 to keep aspect)
    #[arg(long, short = 'w', default_value_t = -1)]
    pub width: i32,
    /// Target height (-1 to keep aspect)
    #[arg(long, short = 'H', default_value_t = -1)]
    pub height: i32,
    /// Output file path
    #[arg(long, short = 'o', default_value = "")]
    pub output: String,
}

pub fn run(args: &ResizeArgs) -> Result<()> {
    let out_path = if args.output.is_empty() {
        super::default_output(&args.input, "_resized.mp4")
    } else {
        args.output.clone()
    };
    let scale = format!("scale={}:{}", args.width.max(-1), args.height.max(-1));
    super::run_ffmpeg(
        "resize",
        &[
            "-i".into(),
            args.input.clone(),
            "-vf".into(),
            scale,
            "-y".into(),
            out_path.clone(),
        ],
    )?;
    println!("resized {} -> {}", args.input, out_path);
    Ok(())
}
