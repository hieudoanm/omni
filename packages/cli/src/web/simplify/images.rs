use anyhow::{anyhow, Result};
use clap::Args;
use serde_json::json;
use std::io::Read;
use std::time::Duration;

#[derive(Args)]
pub struct ImagesArgs {
    /// Page URL to scrape images from
    #[arg(long, short = 'u', default_value = "")]
    pub url: String,
    /// Output directory (default .)
    #[arg(long, short = 'o', default_value = ".")]
    pub out: String,
    /// Specific image index to download (1-based)
    #[arg(long, short = 'i', default_value_t = 0)]
    pub index: usize,
    /// Output in JSON format
    #[arg(long)]
    pub json: bool,
    /// Additional milliseconds to wait after page load for lazy content
    #[arg(long, default_value_t = 0)]
    pub wait: u64,
}

fn fetch_page_html(url: &str, wait_ms: u64) -> Result<String> {
    let opts = crate::browser::Options {
        delay: Duration::from_millis(wait_ms),
        ..Default::default()
    };
    crate::browser::fetch_html(url, opts.delay)
}

fn resolve_url(href: &str, base: &str) -> String {
    let href = href.trim().replace("&amp;", "&");
    if href.starts_with("http://") || href.starts_with("https://") {
        return href;
    }
    let no_scheme = base
        .trim_start_matches("http://")
        .trim_start_matches("https://");
    let (scheme, rest) = base.split_once("://").unwrap_or(("https", base));
    let host = no_scheme.split('/').next().unwrap_or("");
    let host = host.split(':').next().unwrap_or(host);
    let path = format!(
        "/{}",
        no_scheme.split_once('/').map(|(_, p)| p).unwrap_or("")
    );
    let dir = std::path::Path::new(&path)
        .parent()
        .map(|p| p.display().to_string())
        .unwrap_or_default();
    let dir = if dir == "/" { "".to_string() } else { dir };
    if href.starts_with("//") {
        return format!("{scheme}:{href}");
    }
    if href.starts_with('/') {
        return format!("{scheme}://{host}{href}");
    }
    let _ = rest;
    format!("{scheme}://{host}{dir}/{href}")
}

fn extract_image_urls(html: &str, base: &str) -> Vec<String> {
    let doc = scraper::Html::parse_document(html);
    let mut urls = Vec::new();
    let mut seen = std::collections::HashSet::new();
    let add = |raw: &str, urls: &mut Vec<String>, seen: &mut std::collections::HashSet<String>| {
        let abs = resolve_url(raw, base);
        if !abs.is_empty() && seen.insert(abs.clone()) {
            urls.push(abs);
        }
    };
    let sel =
        scraper::Selector::parse("meta[property='og:image'], meta[name='twitter:image'], img")
            .unwrap();
    for el in doc.select(&sel) {
        let tag = el.value().name();
        if tag == "meta" {
            if let Some(c) = el.value().attr("content") {
                add(c, &mut urls, &mut seen);
            }
        } else {
            for attr in ["data-src", "src"] {
                if let Some(v) = el.value().attr(attr) {
                    add(v, &mut urls, &mut seen);
                }
            }
            if let Some(srcset) = el.value().attr("srcset") {
                for part in srcset.split(',') {
                    let part = part.trim();
                    let url = part.split_whitespace().next().unwrap_or("");
                    if !url.is_empty() {
                        add(url, &mut urls, &mut seen);
                    }
                }
            }
        }
    }
    urls
}

fn ext_from_url(raw: &str) -> String {
    let no_scheme = raw.split("://").nth(1).unwrap_or(raw);
    let path = no_scheme.split('?').next().unwrap_or("");
    let last = path.rsplit('/').next().unwrap_or("");
    match last.rsplit_once('.') {
        Some((_, ext)) if ext.len() <= 5 => format!(".{ext}"),
        _ => String::new(),
    }
}

fn slug_from_url(raw: &str) -> String {
    let no_scheme = raw
        .trim_start_matches("http://")
        .trim_start_matches("https://");
    let host = no_scheme.split('/').next().unwrap_or("");
    let host = host
        .strip_prefix("www.")
        .unwrap_or(host)
        .split(':')
        .next()
        .unwrap_or(host);
    let path = no_scheme.split_once('/').map(|(_, p)| p).unwrap_or("");
    let last = path.trim_matches('/').rsplit('/').next().unwrap_or("");
    if last.is_empty() {
        host.to_string()
    } else {
        format!("{host}-{last}")
    }
}

fn download_image_file(raw_url: &str, filename: &str, out_dir: &str) -> Result<String> {
    let agent = ureq::Agent::config_builder()
        .timeout_global(Some(Duration::from_secs(60)))
        .build()
        .new_agent();
    let mut resp = agent
        .get(raw_url)
        .call()
        .map_err(|e| anyhow!("download: {e}"))?;
    let mut body = Vec::new();
    resp.body_mut()
        .as_reader()
        .read_to_end(&mut body)
        .map_err(|e| anyhow!("read: {e}"))?;
    let mut ext = ext_from_url(raw_url);
    if ext.is_empty() {
        let ct = resp
            .headers()
            .get("content-type")
            .and_then(|v| v.to_str().ok())
            .unwrap_or("")
            .to_lowercase();
        ext = if ct.contains("image/jpeg") {
            ".jpg".into()
        } else if ct.contains("image/png") {
            ".png".into()
        } else if ct.contains("image/webp") {
            ".webp".into()
        } else if ct.contains("image/gif") {
            ".gif".into()
        } else if ct.contains("image/svg") {
            ".svg".into()
        } else if ct.contains("image/avif") {
            ".avif".into()
        } else {
            String::new()
        };
    }
    let save_path = format!("{out_dir}/{filename}{ext}");
    std::fs::write(&save_path, &body)?;
    Ok(save_path)
}

pub fn run(args: &ImagesArgs) -> Result<()> {
    if args.url.is_empty() {
        return Err(anyhow!("url is required"));
    }
    if !std::path::Path::new(&args.out).is_dir() {
        std::fs::create_dir_all(&args.out)?;
    }
    let html = fetch_page_html(&args.url, args.wait)?;
    let image_urls = extract_image_urls(&html, &args.url);
    if image_urls.is_empty() {
        return Err(anyhow!("no images found on page"));
    }
    if args.json {
        println!(
            "{}",
            serde_json::to_string_pretty(&json!({
                "source_url": args.url,
                "image_urls": image_urls,
                "count": image_urls.len(),
            }))?
        );
        return Ok(());
    }
    let urls: Vec<String> = if args.index > 0 {
        if args.index > image_urls.len() {
            return Err(anyhow!(
                "index {} out of range (found {} images)",
                args.index,
                image_urls.len()
            ));
        }
        vec![image_urls[args.index - 1].clone()]
    } else {
        image_urls.clone()
    };
    let prefix = slug_from_url(&args.url);
    let mut downloaded = 0;
    for (i, u) in urls.iter().enumerate() {
        let filename = if urls.len() == 1 && args.index > 0 {
            format!("{prefix}_{}", args.index)
        } else if urls.len() == 1 {
            prefix.clone()
        } else {
            format!("{prefix}_{}", i + 1)
        };
        match download_image_file(u, &filename, &args.out) {
            Ok(path) => {
                println!("\x1b[32msaved \x1b[0m{path}");
                downloaded += 1;
            }
            Err(e) => println!("\x1b[31mfailed: {e}\x1b[0m"),
        }
    }
    println!("\nDone. {downloaded} image(s) saved to {}", args.out);
    Ok(())
}
