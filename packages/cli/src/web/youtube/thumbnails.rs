use super::internal;
use anyhow::{anyhow, Result};
use clap::Args;
use serde_json::json;
use std::io::Read;
use std::time::Duration;

#[derive(Args)]
pub struct ThumbnailsArgs {
    /// Video URL or ID
    #[arg(long, short = 'u', default_value = "")]
    pub url: String,
    /// Specific quality to download
    #[arg(long, default_value = "")]
    pub quality: String,
    /// Output directory
    #[arg(long, short = 'o', default_value = ".")]
    pub output: String,
    /// Download all qualities
    #[arg(long)]
    pub all: bool,
    /// List available thumbnail URLs
    #[arg(long)]
    pub list: bool,
    /// Output in JSON format
    #[arg(long)]
    pub json: bool,
}

const QUALITIES: &[(&str, &str, &str)] = &[
    ("maxresdefault", "Max Resolution", "1280×720"),
    ("sddefault", "SD", "640×480"),
    ("hqdefault", "HQ", "480×360"),
    ("mqdefault", "MQ", "320×180"),
    ("default", "Default", "120×90"),
    ("0", "Frame 0", "480×360"),
    ("1", "Frame 1", "120×90"),
    ("2", "Frame 2", "120×90"),
    ("3", "Frame 3", "120×90"),
];

fn thumb_url(video_id: &str, quality_id: &str) -> String {
    format!("https://img.youtube.com/vi/{video_id}/{quality_id}.jpg")
}

fn download_thumb(video_id: &str, quality_id: &str, out_dir: &str) -> Result<String> {
    let raw_url = thumb_url(video_id, quality_id);
    let agent = ureq::Agent::config_builder()
        .timeout_global(Some(Duration::from_secs(15)))
        .build()
        .new_agent();
    let mut resp = agent
        .get(&raw_url)
        .call()
        .map_err(|e| anyhow!("fetch failed: {e}"))?;
    let status = resp.status().as_u16();
    if status != 200 {
        return Err(anyhow!("HTTP {status} for quality {quality_id}"));
    }
    let mut body = Vec::new();
    resp.body_mut()
        .as_reader()
        .read_to_end(&mut body)
        .map_err(|e| anyhow!("read: {e}"))?;
    if body.len() < 1000 {
        return Err(anyhow!(
            "quality {quality_id} not available (too small: {} bytes)",
            body.len()
        ));
    }
    let path = format!("{out_dir}/{video_id}-{quality_id}.jpg");
    std::fs::write(&path, &body).map_err(|e| anyhow!("create file: {e}"))?;
    Ok(path)
}

pub fn run(args: &ThumbnailsArgs) -> Result<()> {
    let video_id = internal::extract(&args.url)?;

    if args.list {
        if args.json {
            let entries: Vec<_> = QUALITIES
                .iter()
                .map(|(id, _, res)| {
                    json!({"id": id, "resolution": res, "url": thumb_url(&video_id, id)})
                })
                .collect();
            println!(
                "{}",
                serde_json::to_string_pretty(
                    &json!({"video_id": video_id, "thumbnails": entries})
                )?
            );
        } else {
            println!("Video ID: {video_id}\n");
            println!("Available thumbnail URLs:");
            for (id, _, res) in QUALITIES {
                println!("  {id:<18} {res:<12} {}", thumb_url(&video_id, id));
            }
        }
        return Ok(());
    }
    println!("Video ID: {video_id}\n");

    std::fs::create_dir_all(&args.output)?;

    let targets: Vec<&(&str, &str, &str)> = if args.all {
        QUALITIES.iter().collect()
    } else if !args.quality.is_empty() {
        let q = args.quality.clone();
        QUALITIES.iter().filter(|(id, _, _)| *id == q).collect()
    } else {
        QUALITIES.iter().take(1).collect()
    };
    if targets.is_empty() {
        let valid = QUALITIES
            .iter()
            .map(|(id, _, _)| *id)
            .collect::<Vec<_>>()
            .join(", ");
        return Err(anyhow!(
            "unknown quality {:?} (valid: {valid})",
            args.quality
        ));
    }

    let mut downloaded = 0;
    for (id, label, res) in &targets {
        println!("  {label} ({res})");
        match download_thumb(&video_id, id, &args.output) {
            Ok(path) => {
                println!("    saved {path}");
                downloaded += 1;
            }
            Err(e) => println!("    skipped: {e}"),
        }
    }
    println!(
        "\nDone. {downloaded}/{} thumbnail(s) saved to {}",
        targets.len(),
        args.output
    );
    Ok(())
}
