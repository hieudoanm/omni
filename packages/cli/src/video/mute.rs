use anyhow::Result;
use clap::Args;

#[derive(Args)]
pub struct MuteArgs {
    /// Input video file
    #[arg()]
    pub input: String,
    /// Output file path
    #[arg(long, short = 'o', default_value = "")]
    pub output: String,
}

pub fn run(args: &MuteArgs) -> Result<()> {
    let out_path = if args.output.is_empty() {
        super::default_output(&args.input, "_muted.mp4")
    } else {
        args.output.clone()
    };
    super::run_ffmpeg(
        "mute",
        &[
            "-i".into(),
            args.input.clone(),
            "-an".into(),
            "-y".into(),
            out_path.clone(),
        ],
    )?;
    println!("muted {} -> {}", args.input, out_path);
    Ok(())
}
