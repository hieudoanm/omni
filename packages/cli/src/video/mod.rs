pub mod compress;
pub mod convert;
pub mod extractaudio;
pub mod mute;
pub mod resize;
pub mod subtitles;
pub mod togif;
pub mod tomp3;
pub mod trim;

use anyhow::Result;
use clap::{Args, Subcommand};

#[derive(Args)]
pub struct VideoArgs {
    #[command(subcommand)]
    pub command: Option<VideoCommand>,
}

#[derive(Subcommand)]
pub enum VideoCommand {
    /// Compress video using CRF encoding
    Compress(compress::CompressArgs),
    /// Convert video format
    Convert(convert::ConvertArgs),
    /// Extract audio track from video
    #[command(name = "extract-audio")]
    ExtractAudio(extractaudio::ExtractAudioArgs),
    /// Mute video audio track
    Mute(mute::MuteArgs),
    /// Resize video dimensions
    Resize(resize::ResizeArgs),
    /// Extract or burn subtitles
    Subtitles(subtitles::SubtitlesArgs),
    /// Convert video to GIF
    #[command(name = "to-gif")]
    ToGif(togif::ToGifArgs),
    /// Convert video to MP3
    #[command(name = "to-mp3")]
    ToMp3(tomp3::ToMp3Args),
    /// Trim video by time range
    Trim(trim::TrimArgs),
}

pub fn run(args: &VideoArgs) -> Result<()> {
    match &args.command {
        Some(VideoCommand::Compress(a)) => compress::run(a),
        Some(VideoCommand::Convert(a)) => convert::run(a),
        Some(VideoCommand::ExtractAudio(a)) => extractaudio::run(a),
        Some(VideoCommand::Mute(a)) => mute::run(a),
        Some(VideoCommand::Resize(a)) => resize::run(a),
        Some(VideoCommand::Subtitles(a)) => subtitles::run(a),
        Some(VideoCommand::ToGif(a)) => togif::run(a),
        Some(VideoCommand::ToMp3(a)) => tomp3::run(a),
        Some(VideoCommand::Trim(a)) => trim::run(a),
        None => {
            println!("Video processing utilities powered by FFmpeg\n");
            println!("Usage:\n  omni video [command]\n");
            println!("Available Commands:");
            println!("  compress       Compress video using CRF encoding");
            println!("  convert        Convert video format");
            println!("  extract-audio  Extract audio track from video");
            println!("  mute           Mute video audio track");
            println!("  resize         Resize video dimensions");
            println!("  subtitles      Extract or burn subtitles");
            println!("  to-gif         Convert video to GIF");
            println!("  to-mp3         Convert video to MP3");
            println!("  trim           Trim video by time range");
            println!("\nFlags:\n  -h, --help   help for video");
            Ok(())
        }
    }
}

/// Shared ffmpeg runner: checks PATH, builds args, runs, reports errors
/// in the Go `fmt.Errorf("video X: %w\n%s", err, out)` style.
pub(crate) fn run_ffmpeg(cmd_name: &str, args: &[String]) -> Result<()> {
    let found = std::env::var_os("PATH")
        .map(|paths| {
            std::env::split_paths(&paths)
                .map(|d| d.join("ffmpeg"))
                .any(|p| p.is_file())
        })
        .unwrap_or(false);
    if !found {
        anyhow::bail!("video {cmd_name}: ffmpeg not found on PATH");
    }
    let out = std::process::Command::new("ffmpeg")
        .args(args)
        .output()
        .map_err(|e| anyhow::anyhow!("video {cmd_name}: {e}"))?;
    if !out.status.success() {
        anyhow::bail!(
            "video {cmd_name}: {}\n{}",
            out.status,
            String::from_utf8_lossy(&out.stderr)
        );
    }
    Ok(())
}

/// Default output path: strip ext, append suffix+ext (Go filepath logic).
pub(crate) fn default_output(input: &str, suffix_ext: &str) -> String {
    let p = std::path::Path::new(input);
    let stem = p
        .file_stem()
        .map(|s| s.to_string_lossy().to_string())
        .unwrap_or_else(|| input.to_string());
    format!("{stem}{suffix_ext}")
}
