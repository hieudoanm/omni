use anyhow::{anyhow, Context, Result};
use sha2::{Digest, Sha256};

/// Go `internal.SplitLines`: split on '\n', trim trailing '\r'; always yields
/// a final element even for a trailing newline.
pub fn split_lines(s: &str) -> Vec<String> {
    let mut lines = Vec::new();
    let bytes = s.as_bytes();
    let mut start = 0usize;
    for i in 0..bytes.len() {
        if bytes[i] == b'\n' {
            lines.push(s[start..i].trim_end_matches('\r').to_string());
            start = i + 1;
        }
    }
    if start <= bytes.len() {
        lines.push(s[start..].trim_end_matches('\r').to_string());
    }
    lines
}

pub fn join_lines(lines: &[String]) -> String {
    lines.join("\n")
}

/// Go `internal.FormatSize`: %.1f KB/MB/GB/TB at 1024 boundaries.
pub fn format_size(bytes: i64) -> String {
    const UNIT: i64 = 1024;
    if bytes < UNIT {
        return format!("{bytes} B");
    }
    let mut div = UNIT;
    let mut exp = 0usize;
    let mut n = bytes / UNIT;
    while n >= UNIT {
        div *= UNIT;
        exp += 1;
        n /= UNIT;
    }
    let sizes = ["KB", "MB", "GB", "TB"];
    format!("{:.1} {}", bytes as f64 / div as f64, sizes[exp.min(3)])
}

/// Go `internal.ParseMode`: octal string -> permission bits.
pub fn parse_mode(s: &str) -> Result<u32> {
    u32::from_str_radix(s, 8).map_err(|_| anyhow!("invalid mode {s:?} (use octal e.g. 755)"))
}

/// Go `internal.DetectMIME`: extension -> MIME map.
pub fn detect_mime(path: &str) -> &'static str {
    let ext = std::path::Path::new(path)
        .extension()
        .map(|e| format!(".{}", e.to_string_lossy().to_lowercase()))
        .unwrap_or_default();
    match ext.as_str() {
        ".txt" => "text/plain",
        ".md" => "text/markdown",
        ".html" => "text/html",
        ".css" => "text/css",
        ".js" => "text/javascript",
        ".json" => "application/json",
        ".xml" => "application/xml",
        ".yml" | ".yaml" => "application/x-yaml",
        ".toml" => "application/toml",
        ".csv" => "text/csv",
        ".jpg" | ".jpeg" => "image/jpeg",
        ".png" => "image/png",
        ".gif" => "image/gif",
        ".svg" => "image/svg+xml",
        ".webp" => "image/webp",
        ".pdf" => "application/pdf",
        ".doc" => "application/msword",
        ".docx" => "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ".xls" => "application/vnd.ms-excel",
        ".xlsx" => "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        ".zip" => "application/zip",
        ".tar" => "application/x-tar",
        ".gz" => "application/gzip",
        ".mp3" => "audio/mpeg",
        ".mp4" => "video/mp4",
        ".go" => "text/x-go",
        ".py" => "text/x-python",
        ".rs" => "text/x-rust",
        ".sh" => "text/x-shellscript",
        ".swift" => "text/x-swift",
        _ => "application/octet-stream",
    }
}

/// Go `internal.QuickHash`: SHA-256 hex of file contents.
pub fn quick_hash(path: &str) -> Result<String> {
    let data = std::fs::read(path).map_err(|e| anyhow!("read {path}: {e}"))?;
    let mut h = Sha256::new();
    h.update(&data);
    Ok(hex::encode(h.finalize()))
}

pub fn read_file_bytes(path: &str) -> Result<Vec<u8>> {
    std::fs::read(path).with_context(|| format!("read {path}"))
}
