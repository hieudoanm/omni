use anyhow::Result;
use clap::Args;

#[derive(Args)]
pub struct CompressArgs {
    /// Input video file
    #[arg()]
    pub input: String,
    /// CRF value 0-51 (lower = better quality)
    #[arg(long, short = 'q', default_value_t = 23)]
    pub quality: i32,
    /// Output file path
    #[arg(long, short = 'o', default_value = "")]
    pub output: String,
}

pub fn run(args: &CompressArgs) -> Result<()> {
    let out_path = if args.output.is_empty() {
        super::default_output(&args.input, "_compressed.mp4")
    } else {
        args.output.clone()
    };
    super::run_ffmpeg(
        "compress",
        &[
            "-i".into(),
            args.input.clone(),
            "-crf".into(),
            args.quality.to_string(),
            "-y".into(),
            out_path.clone(),
        ],
    )?;
    println!("compressed {} -> {}", args.input, out_path);
    Ok(())
}
