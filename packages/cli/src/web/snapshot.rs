use crate::browser;
use anyhow::{anyhow, Result};
use clap::Args;
use serde::Serialize;
use std::time::Duration;

#[derive(Args)]
pub struct SnapshotArgs {
    /// URL to capture
    #[arg(long, short = 'u', default_value = "")]
    pub url: String,
    /// Output file or directory
    #[arg(long, short = 'o', default_value = "")]
    pub output: String,
    /// Viewport width (overrides --preset)
    #[arg(long, default_value_t = 0)]
    pub width: u32,
    /// Viewport height (overrides --preset)
    #[arg(long, default_value_t = 0)]
    pub height: u32,
    /// Viewport preset: desktop|laptop|tablet|mobile|hd|4k
    #[arg(long, default_value = "desktop")]
    pub preset: String,
    /// Capture full scrollable page
    #[arg(long)]
    pub full_page: bool,
    /// Wait before capturing (e.g. 500ms, 2s)
    #[arg(long, default_value = "")]
    pub delay: String,
    /// Save as PDF instead of PNG
    #[arg(long)]
    pub pdf: bool,
    /// Screenshot quality 1-100 (JPEG only)
    #[arg(long, default_value_t = 90)]
    pub quality: u8,
    /// Print extra info
    #[arg(long, short = 'v')]
    pub verbose: bool,
    /// Output in JSON format
    #[arg(long)]
    pub json: bool,
}

#[derive(Serialize)]
struct SnapshotResult {
    url: String,
    file: String,
    size_kb: usize,
    time_sec: String,
    format: String,
    viewport: String,
    full_page: bool,
}

fn parse_duration(s: &str) -> Result<Duration> {
    if s.is_empty() {
        return Ok(Duration::ZERO);
    }
    let (num, unit) = s.split_at(s.find(|c: char| c.is_alphabetic()).unwrap_or(s.len()));
    let n: f64 = num
        .parse()
        .map_err(|_| anyhow!("invalid delay {s:?}: use format like 500ms, 2s, 1m"))?;
    let mult = match unit {
        "ns" => 1e-9,
        "us" | "µs" => 1e-6,
        "ms" => 1e-3,
        "s" => 1.0,
        "m" => 60.0,
        "h" => 3600.0,
        _ => {
            return Err(anyhow!(
                "invalid delay {s:?}: use format like 500ms, 2s, 1m"
            ))
        }
    };
    Ok(Duration::from_secs_f64(n * mult))
}

fn hostname_slug(raw_url: &str) -> String {
    let no_scheme = raw_url
        .trim_start_matches("http://")
        .trim_start_matches("https://");
    let host = no_scheme.split('/').next().unwrap_or("");
    let host = host.split(':').next().unwrap_or(host);
    if host.is_empty() {
        "snapshot".to_string()
    } else {
        host.replace(['.', ':'], "_")
    }
}

fn timestamp() -> String {
    chrono::Local::now().format("%Y%m%d_%H%M%S").to_string()
}

fn generated_name(raw_url: &str, pdf: bool) -> String {
    let ext = if pdf { ".pdf" } else { ".png" };
    format!("{}_{}{}", hostname_slug(raw_url), timestamp(), ext)
}

fn resolve_output(output: &str, raw_url: &str, pdf: bool) -> Result<String> {
    let path = std::path::Path::new(output);
    if path.is_dir() || output.ends_with('/') {
        std::fs::create_dir_all(output)?;
        let sep = if output.ends_with('/') { "" } else { "/" };
        return Ok(format!("{output}{sep}{}", generated_name(raw_url, pdf)));
    }
    if let Some(dir) = path.parent() {
        if !dir.as_os_str().is_empty() {
            std::fs::create_dir_all(dir)?;
        }
    }
    Ok(output.to_string())
}

pub fn run(args: &SnapshotArgs, json: bool) -> Result<()> {
    let mut raw_url = args.url.clone();
    if raw_url.is_empty() {
        print!("Enter URL: ");
        use std::io::Write;
        std::io::stdout().flush()?;
        let mut line = String::new();
        std::io::stdin().read_line(&mut line)?;
        raw_url = line.trim().to_string();
    }
    if raw_url.is_empty() {
        return Err(anyhow!("url is required"));
    }
    if !raw_url.starts_with("http://") && !raw_url.starts_with("https://") {
        raw_url = format!("https://{raw_url}");
    }

    let mut opts = browser::Options::default();
    if let Some((w, h)) = browser::preset(&args.preset) {
        opts.width = w;
        opts.height = h;
    }
    if args.width > 0 {
        opts.width = args.width;
    }
    if args.height > 0 {
        opts.height = args.height;
    }
    opts.full_page = args.full_page;
    opts.pdf = args.pdf;
    opts.quality = args.quality;
    opts.delay = parse_duration(&args.delay)?;

    let _ext = if opts.pdf { ".pdf" } else { ".png" };
    let out_path = if args.output.is_empty() {
        let home = dirs::home_dir().ok_or_else(|| anyhow!("getting home dir"))?;
        let dir = home.join(".snapshot");
        std::fs::create_dir_all(&dir)?;
        dir.join(generated_name(&raw_url, opts.pdf))
            .display()
            .to_string()
    } else {
        resolve_output(&args.output, &raw_url, opts.pdf)?
    };

    let start = std::time::Instant::now();
    let data = browser::capture(&raw_url, &opts).map_err(|e| anyhow!("capture failed: {e}"))?;
    let elapsed = start.elapsed().as_secs_f64();
    std::fs::write(&out_path, &data)?;

    let r = SnapshotResult {
        url: raw_url.clone(),
        file: out_path.clone(),
        size_kb: data.len() / 1024,
        time_sec: format!("{elapsed:.1}"),
        format: if opts.pdf { "PDF".into() } else { "PNG".into() },
        viewport: format!("{}x{}", opts.width, opts.height),
        full_page: opts.full_page,
    };

    if json {
        println!("{}", serde_json::to_string_pretty(&r)?);
    } else {
        println!("Capturing {}", r.url);
        if args.verbose {
            println!("    Viewport : {}", r.viewport);
            println!("    Full page: {}", r.full_page);
            println!("    Format   : {}", r.format);
        }
        println!("Saved -> {}", r.file);
        if args.verbose {
            println!("    Size: {} KB | Time: {}s", r.size_kb, r.time_sec);
        }
    }
    Ok(())
}
