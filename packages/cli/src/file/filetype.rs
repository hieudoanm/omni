use super::internal;
use anyhow::Result;
use clap::Args;
use serde_json::json;

#[derive(Args)]
pub struct TypeArgs {
    /// File path
    #[arg(long, short = 'f', default_value = "")]
    pub file: String,
}

pub fn run(args: &TypeArgs, json_out: bool) -> Result<()> {
    let info = std::fs::metadata(&args.file)?;
    let mime = internal::detect_mime(&args.file);

    if json_out {
        println!(
            "{}",
            serde_json::to_string_pretty(&json!({
                "file": args.file,
                "size": info.len(),
                "mime": mime,
                "mode": mode_string(&info),
                "modified": modified_string(&info),
            }))?
        );
        return Ok(());
    }

    println!("File     : {}", args.file);
    println!("Size     : {}", internal::format_size(info.len() as i64));
    println!("MIME     : {mime}");
    println!("Mode     : {}", mode_string(&info));
    if !info.is_dir() {
        if let Some(m) = info
            .modified()
            .ok()
            .and_then(|t| t.duration_since(std::time::UNIX_EPOCH).ok())
        {
            let dt = chrono::DateTime::from_timestamp(m.as_secs() as i64, 0).unwrap_or_default();
            println!("Modified : {}", dt.format("%Y-%m-%d %H:%M:%S"));
        }
    }
    Ok(())
}

#[cfg(unix)]
fn mode_string(info: &std::fs::Metadata) -> String {
    use std::os::unix::fs::PermissionsExt;
    // Go os.FileMode.String() is complex; approximate with octal + type char.
    let mode = info.permissions().mode();
    let kind = if info.is_dir() { 'd' } else { '-' };
    let mut s = String::new();
    s.push(kind);
    for shift in [6, 3, 0] {
        let bits = (mode >> shift) & 0o7;
        s.push(if bits & 0o4 != 0 { 'r' } else { '-' });
        s.push(if bits & 0o2 != 0 { 'w' } else { '-' });
        s.push(if bits & 0o1 != 0 { 'x' } else { '-' });
    }
    s
}

#[cfg(not(unix))]
fn mode_string(_info: &std::fs::Metadata) -> String {
    String::new()
}

fn modified_string(info: &std::fs::Metadata) -> String {
    info.modified()
        .ok()
        .and_then(|t| t.duration_since(std::time::UNIX_EPOCH).ok())
        .and_then(|d| chrono::DateTime::from_timestamp(d.as_secs() as i64, 0))
        .map(|dt| dt.format("%Y-%m-%dT%H:%M:%SZ").to_string())
        .unwrap_or_default()
}
