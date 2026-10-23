use anyhow::Result;
use clap::Args;

#[derive(Args)]
pub struct TrimArgs {
    /// Input video file
    #[arg()]
    pub input: String,
    /// Start time (e.g. 00:01:30)
    #[arg(long, short = 's', default_value = "0")]
    pub start: String,
    /// Duration (e.g. 00:00:30)
    #[arg(long, short = 'd', default_value = "")]
    pub duration: String,
    /// End time (alternative to duration)
    #[arg(long, short = 't', default_value = "")]
    pub to: String,
    /// Output file path
    #[arg(long, short = 'o', default_value = "")]
    pub output: String,
}

pub fn run(args: &TrimArgs) -> Result<()> {
    let out_path = if args.output.is_empty() {
        super::default_output(&args.input, "_trimmed.mp4")
    } else {
        args.output.clone()
    };
    let mut ffargs = vec![
        "-i".to_string(),
        args.input.clone(),
        "-ss".to_string(),
        args.start.clone(),
    ];
    if !args.duration.is_empty() {
        ffargs.push("-t".to_string());
        ffargs.push(args.duration.clone());
    } else if !args.to.is_empty() {
        ffargs.push("-to".to_string());
        ffargs.push(args.to.clone());
    }
    ffargs.push("-y".to_string());
    ffargs.push(out_path.clone());
    super::run_ffmpeg("trim", &ffargs)?;
    println!("trimmed {} -> {}", args.input, out_path);
    Ok(())
}
