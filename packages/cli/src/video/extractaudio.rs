use anyhow::Result;
use clap::Args;

#[derive(Args)]
pub struct ExtractAudioArgs {
    /// Input video file
    #[arg()]
    pub input: String,
    /// Audio format (mp3, wav, flac, ogg, m4a)
    #[arg(long, short = 'f', default_value = "mp3")]
    pub format: String,
    /// Output file path
    #[arg(long, short = 'o', default_value = "")]
    pub output: String,
}

fn codec_for_format(fmt: &str) -> &'static str {
    match fmt {
        "mp3" => "libmp3lame",
        "wav" => "pcm_s16le",
        "flac" => "flac",
        "ogg" => "libvorbis",
        "m4a" => "aac",
        _ => "",
    }
}

pub fn run(args: &ExtractAudioArgs) -> Result<()> {
    let out_fmt = if args.format.is_empty() {
        "mp3"
    } else {
        &args.format
    };
    let out_path = if args.output.is_empty() {
        super::default_output(&args.input, &format!("_audio.{out_fmt}"))
    } else {
        args.output.clone()
    };
    let mut ffargs = vec!["-i".to_string(), args.input.clone(), "-vn".to_string()];
    let codec = codec_for_format(out_fmt);
    if !codec.is_empty() {
        ffargs.push("-acodec".to_string());
        ffargs.push(codec.to_string());
    }
    ffargs.push("-y".to_string());
    ffargs.push(out_path.clone());
    super::run_ffmpeg("extract-audio", &ffargs)?;
    println!("extracted audio {} -> {}", args.input, out_path);
    Ok(())
}
