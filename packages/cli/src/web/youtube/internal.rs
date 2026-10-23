use anyhow::{anyhow, Result};

pub fn extract_video_id(input: &str) -> Result<String> {
    let input = input.trim();
    let patterns: &[&str] = &[
        r"(?:youtube\.com/watch\?.*v=)([a-zA-Z0-9_-]{11})",
        r"(?:youtu\.be/)([a-zA-Z0-9_-]{11})",
        r"(?:youtube\.com/embed/)([a-zA-Z0-9_-]{11})",
        r"(?:youtube\.com/shorts/)([a-zA-Z0-9_-]{11})",
        r"^([a-zA-Z0-9_-]{11})$",
    ];
    for p in patterns {
        let re = regex::Regex::new(p).unwrap();
        if let Some(c) = re.captures(input) {
            return Ok(c[1].to_string());
        }
    }
    Err(anyhow!("could not extract video ID from {input:?}"))
}

pub use extract_video_id as extract;
