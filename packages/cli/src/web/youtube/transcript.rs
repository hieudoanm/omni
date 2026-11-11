//! YouTube transcript fetcher — Innertube API with HTML-scrape fallback.
use anyhow::{anyhow, Result};
use regex::Regex;
use serde::Deserialize;
use std::sync::OnceLock;
use std::time::Duration;

const USER_AGENT: &str = "Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 Chrome/90.0.4430.91 Mobile Safari/537.36";
const INNERTUBE_URL: &str = "https://www.youtube.com/youtubei/v1/player?key=%s";
const CLIENT_NAME: &str = "ANDROID";
const CLIENT_VERSION: &str = "20.10.38";

fn re_api_key() -> &'static Regex {
    static RE: OnceLock<Regex> = OnceLock::new();
    RE.get_or_init(|| Regex::new(r#""INNERTUBE_API_KEY":"([^"]+)""#).unwrap())
}
fn re_player_resp() -> &'static Regex {
    static RE: OnceLock<Regex> = OnceLock::new();
    RE.get_or_init(|| {
        Regex::new(
            r"ytInitialPlayerResponse\s*=\s*(\{.+?\})\s*;\s*(?:var\s+(?:meta|head)|</script|\n)",
        )
        .unwrap()
    })
}

#[derive(Debug, Clone, Deserialize)]
pub struct CaptionTrack {
    #[serde(rename = "baseUrl")]
    pub base_url: String,
    #[serde(rename = "languageCode")]
    pub language_code: String,
    #[serde(default)]
    pub kind: String,
    #[allow(dead_code)]
    pub name: Option<serde_json::Value>,
    #[serde(rename = "isTranslatable", default)]
    pub _is_translatable: bool,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct Line {
    pub start: f64,
    pub duration: f64,
    pub text: String,
}

#[derive(Debug, serde::Serialize)]
pub struct Transcript {
    #[serde(rename = "videoId")]
    pub video_id: String,
    pub language: String,
    pub kind: String,
    pub lines: Vec<Line>,
}

fn agent() -> ureq::Agent {
    ureq::Agent::config_builder()
        .timeout_global(Some(Duration::from_secs(15)))
        .build()
        .new_agent()
}

fn get_page(video_id: &str) -> Result<String> {
    agent()
        .get(&format!("https://www.youtube.com/watch?v={video_id}"))
        .header("User-Agent", USER_AGENT)
        .header("Accept-Language", "en-US,en;q=0.9")
        .call()
        .map_err(|e| anyhow!("fetching page: {e}"))?
        .into_body()
        .read_to_string()
        .map_err(|e| anyhow!("reading page: {e}"))
}

fn parse_caption_tracks(json_text: &str) -> Result<Vec<CaptionTrack>> {
    let raw: serde_json::Value = serde_json::from_str(json_text)?;
    let tracks = raw
        .pointer("/captions/playerCaptionsTracklistRenderer/captionTracks")
        .and_then(|v| serde_json::from_value::<Vec<CaptionTrack>>(v.clone()).ok())
        .unwrap_or_default();
    let mut tracks = tracks;
    for t in &mut tracks {
        t.base_url = html_unescape(&t.base_url);
    }
    Ok(tracks)
}

fn html_unescape(s: &str) -> String {
    s.replace("&amp;", "&")
        .replace("&lt;", "<")
        .replace("&gt;", ">")
        .replace("&quot;", "\"")
        .replace("&#39;", "'")
        .replace("&apos;", "'")
}

fn tracks_via_innertube(video_id: &str, page_html: &str) -> Result<Vec<CaptionTrack>> {
    let caps = re_api_key()
        .captures(page_html)
        .ok_or_else(|| anyhow!("INNERTUBE_API_KEY not found in page"))?;
    let api_key = &caps[1];
    let body = serde_json::json!({
        "context": {"client": {"clientName": CLIENT_NAME, "clientVersion": CLIENT_VERSION}},
        "videoId": video_id,
    });
    let resp = agent()
        .post(&INNERTUBE_URL.replace("%s", api_key))
        .header("Content-Type", "application/json")
        .header("User-Agent", USER_AGENT)
        .send_json(body)
        .map_err(|e| anyhow!("innertube request: {e}"))?;
    parse_caption_tracks(&resp.into_body().read_to_string().unwrap_or_default())
}

fn tracks_via_html_scrape(page_html: &str) -> Result<Vec<CaptionTrack>> {
    let caps = re_player_resp()
        .captures(page_html)
        .ok_or_else(|| anyhow!("ytInitialPlayerResponse not found in page"))?;
    parse_caption_tracks(&caps[1])
}

fn parse_timed_text(data: &str) -> Result<Vec<Line>> {
    // YouTube returns XML3 timedtext: <body><p t="123" d="456">text</p></body>
    // t/d are milliseconds. Inner markup (<s>…) is stripped.
    let re = Regex::new(r#"(?s)<p\s[^>]*\bt="(\d+)"[^>]*\bd="(\d+)"[^>]*>(.*?)</p>"#).unwrap();
    let tag_re = Regex::new(r"<[^>]+>").unwrap();
    let mut lines = Vec::new();
    for cap in re.captures_iter(data) {
        let inner = tag_re.replace_all(&cap[3], "");
        let text = html_unescape(&inner);
        let text = text.split_whitespace().collect::<Vec<_>>().join(" ");
        if text.is_empty() {
            continue;
        }
        lines.push(Line {
            start: cap[1].parse::<f64>().unwrap_or(0.0) / 1000.0,
            duration: cap[2].parse::<f64>().unwrap_or(0.0) / 1000.0,
            text,
        });
    }
    if lines.is_empty() {
        return Err(anyhow!("no transcript lines found in timedtext response"));
    }
    Ok(lines)
}

fn select_track<'a>(tracks: &'a [CaptionTrack], lang: &str) -> Option<&'a CaptionTrack> {
    let mut fallback = None;
    for t in tracks {
        if t.language_code == lang {
            if t.kind != "asr" {
                return Some(t);
            }
            fallback = Some(t);
        }
    }
    fallback
}

fn available_langs(tracks: &[CaptionTrack]) -> String {
    let mut seen = std::collections::HashSet::new();
    let mut langs = Vec::new();
    for t in tracks {
        if seen.insert(t.language_code.clone()) {
            langs.push(t.language_code.clone());
        }
    }
    langs.join(", ")
}

fn fetch_captions(base_url: &str) -> Result<Vec<Line>> {
    let body = agent()
        .get(base_url)
        .call()
        .map_err(|e| anyhow!("fetching captions XML: {e}"))?
        .into_body()
        .read_to_string()
        .map_err(|e| anyhow!("reading captions: {e}"))?;
    parse_timed_text(&body)
}

pub fn fetch(video_id: &str, lang: &str) -> Result<Transcript> {
    let page_html = get_page(video_id)?;
    let tracks = tracks_via_innertube(video_id, &page_html)
        .or_else(|_| tracks_via_html_scrape(&page_html))
        .map_err(|e| anyhow!("could not extract caption tracks: {e}"))?;
    if tracks.is_empty() {
        return Err(anyhow!(
            "no caption tracks found — video may have no captions"
        ));
    }
    let track = select_track(&tracks, lang).ok_or_else(|| {
        anyhow!(
            "no captions for language {lang:?} (available: {})",
            available_langs(&tracks)
        )
    })?;
    let lines = fetch_captions(&track.base_url)?;
    let kind = if track.kind == "asr" {
        "auto-generated"
    } else {
        "manual"
    };
    Ok(Transcript {
        video_id: video_id.to_string(),
        language: track.language_code.clone(),
        kind: kind.to_string(),
        lines,
    })
}
