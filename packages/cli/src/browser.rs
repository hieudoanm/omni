//! Headless Chrome helpers via headless_chrome (mirrors libs/browser in cli.go).
use anyhow::{anyhow, Result};
use headless_chrome::{Browser, LaunchOptions};
use std::path::PathBuf;
use std::time::Duration;

#[derive(Clone, Debug)]
pub struct Options {
    pub width: u32,
    pub height: u32,
    pub full_page: bool,
    pub delay: Duration,
    pub quality: u8,
    pub pdf: bool,
}

impl Default for Options {
    fn default() -> Self {
        Options {
            width: 1440,
            height: 900,
            full_page: false,
            delay: Duration::ZERO,
            quality: 90,
            pdf: false,
        }
    }
}

pub fn presets() -> &'static [(&'static str, u32, u32)] {
    &[
        ("desktop", 1440, 900),
        ("laptop", 1280, 800),
        ("tablet", 768, 1024),
        ("mobile", 390, 844),
        ("hd", 1920, 1080),
        ("4k", 3840, 2160),
    ]
}

pub fn preset(name: &str) -> Option<(u32, u32)> {
    presets()
        .iter()
        .find(|(n, _, _)| *n == name)
        .map(|(_, w, h)| (*w, *h))
}

#[allow(dead_code)]
pub fn nearest_preset(w: u32, h: u32) -> &'static str {
    let mut best = "desktop";
    let mut best_dist = f64::MAX;
    for (name, pw, ph) in presets() {
        let d = ((*pw as f64 - w as f64).powi(2) + (*ph as f64 - h as f64).powi(2)).sqrt();
        if d < best_dist {
            best_dist = d;
            best = name;
        }
    }
    best
}

const SYSTEM_PATHS: &[&str] = &[
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary",
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
];

/// chromePath resolves the Chrome/Chromium executable:
/// CHROME_PATH env → system paths → puppeteer cache → headless_chrome auto-download.
pub fn chrome_path() -> Option<PathBuf> {
    if let Ok(p) = std::env::var("CHROME_PATH") {
        if !p.is_empty() {
            return Some(PathBuf::from(p));
        }
    }
    for p in SYSTEM_PATHS {
        if PathBuf::from(p).exists() {
            return Some(PathBuf::from(p));
        }
    }
    if let Some(home) = dirs::home_dir() {
        let cache = home.join(".cache/puppeteer/chrome");
        if let Ok(entries) = std::fs::read_dir(&cache) {
            let dirs: Vec<PathBuf> = entries.flatten().map(|e| e.path()).collect();
            let mut matches: Vec<PathBuf> = Vec::new();
            for platform in ["mac_arm-", "mac-", "linux-"] {
                for dir in &dirs {
                    let name = dir
                        .file_name()
                        .unwrap_or_default()
                        .to_string_lossy()
                        .to_string();
                    if !name.starts_with(platform) {
                        continue;
                    }
                    let dir = dir.clone();
                    for cand in [
                        "chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing",
                        "chrome-mac-x64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing",
                        "chrome-linux64/chrome",
                    ] {
                        let p = dir.join(cand);
                        if p.exists() {
                            matches.push(p);
                        }
                    }
                }
            }
            matches.sort();
            if let Some(last) = matches.last() {
                return Some(last.clone());
            }
        }
    }
    None
}

fn launch_options<'a>(args: Vec<&'a std::ffi::OsStr>) -> LaunchOptions<'a> {
    let mut b = LaunchOptions::default_builder();
    b.headless(true).sandbox(false).enable_gpu(false).args(args);
    if let Some(p) = chrome_path() {
        b.path(Some(p));
    }
    b.build().unwrap_or_else(|e| panic!("launch options: {e}"))
}

fn with_browser<T>(f: impl FnOnce(&Browser) -> Result<T>) -> Result<T> {
    let browser = Browser::new(launch_options(vec![
        std::ffi::OsStr::new("--no-sandbox"),
        std::ffi::OsStr::new("--disable-gpu"),
        std::ffi::OsStr::new("--disable-dev-shm-usage"),
    ]))
    .map_err(|e| anyhow!("launching browser: {e}"))?;
    f(&browser)
}

/// Navigate to url, wait for load + delay, return rendered HTML.
pub fn fetch_html(url: &str, delay: Duration) -> Result<String> {
    with_browser(|browser| {
        let tab = browser
            .new_tab()
            .map_err(|e| anyhow!("creating page: {e}"))?;
        tab.navigate_to(url)
            .map_err(|e| anyhow!("navigating to {url}: {e}"))?;
        tab.wait_until_navigated()
            .map_err(|e| anyhow!("waiting for load: {e}"))?;
        if !delay.is_zero() {
            std::thread::sleep(delay);
        }
        tab.get_content().map_err(|e| anyhow!("reading html: {e}"))
    })
}

/// Capture url as PNG (or PDF) bytes.
pub fn capture(url: &str, opts: &Options) -> Result<Vec<u8>> {
    use headless_chrome::protocol::cdp::{Emulation, Page::CaptureScreenshotFormatOption};
    with_browser(|browser| {
        let tab = browser
            .new_tab()
            .map_err(|e| anyhow!("creating page: {e}"))?;
        tab.call_method(Emulation::SetDeviceMetricsOverride {
            width: opts.width,
            height: opts.height,
            device_scale_factor: 1.0,
            mobile: false,
            scale: None,
            screen_width: None,
            screen_height: None,
            position_x: None,
            position_y: None,
            dont_set_visible_size: None,
            screen_orientation: None,
            viewport: None,
            display_feature: None,
            device_posture: None,
        })
        .map_err(|e| anyhow!("setting viewport: {e}"))?;
        tab.navigate_to(url)
            .map_err(|e| anyhow!("navigating to {url}: {e}"))?;
        tab.wait_until_navigated()
            .map_err(|e| anyhow!("waiting for load: {e}"))?;
        if !opts.delay.is_zero() {
            std::thread::sleep(opts.delay);
        }
        if opts.pdf {
            let opts_pdf = headless_chrome::types::PrintToPdfOptions {
                print_background: Some(true),
                prefer_css_page_size: Some(true),
                ..Default::default()
            };
            return tab
                .print_to_pdf(Some(opts_pdf))
                .map_err(|e| anyhow!("printing to PDF: {e}"));
        }
        let mut width = opts.width;
        let mut height = opts.height;
        if opts.full_page {
            // Approximate captureBeyondViewport: expand viewport to scroll size.
            if let Ok(obj) = tab.evaluate(
                "Math.max(document.body.scrollWidth, document.documentElement.scrollWidth) + ',' + Math.max(document.body.scrollHeight, document.documentElement.scrollHeight)",
                true,
            ) {
                if let Some(s) = obj.value.and_then(|v| v.as_str().map(|s| s.to_string())) {
                    let mut it = s.split(',');
                    if let (Some(w), Some(h)) = (it.next(), it.next()) {
                        if let (Ok(w), Ok(h)) = (w.trim().parse::<u32>(), h.trim().parse::<u32>()) {
                            width = w.min(16384);
                            height = h.min(16384);
                        }
                    }
                }
            }
            tab.call_method(Emulation::SetDeviceMetricsOverride {
                width,
                height,
                device_scale_factor: 1.0,
                mobile: false,
                scale: None,
                screen_width: None,
                screen_height: None,
                position_x: None,
                position_y: None,
                dont_set_visible_size: None,
                screen_orientation: None,
                viewport: None,
                display_feature: None,
                device_posture: None,
            })
            .ok();
        }
        tab.capture_screenshot(
            CaptureScreenshotFormatOption::Png,
            Some(opts.quality as u32),
            None,
            true,
        )
        .map_err(|e| anyhow!("screenshot: {e}"))
    })
}
