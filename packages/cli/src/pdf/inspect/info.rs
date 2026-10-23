use crate::pdf::internal::*;
use anyhow::Result;
use clap::Args;
use std::path::Path;

#[derive(Args)]
pub struct InfoArgs {
    /// PDF file
    pub file: String,
}

fn format_size(bytes: u64) -> String {
    if bytes >= 1_000_000 {
        format!("{:.1} MB", bytes as f64 / 1_000_000.0)
    } else if bytes >= 1_000 {
        format!("{:.1} KB", bytes as f64 / 1_000.0)
    } else {
        format!("{} B", bytes)
    }
}

pub fn run(args: &InfoArgs) -> Result<()> {
    let doc = load(&args.file)?;
    let size = std::fs::metadata(&args.file).map(|m| m.len()).unwrap_or(0);
    println!(
        "File: {}",
        Path::new(&args.file)
            .file_name()
            .unwrap_or_default()
            .to_string_lossy()
    );
    println!("Pages: {}", page_count(&doc));
    println!("Version: {}", doc.version.as_str());
    println!("Encrypted: {}", doc.is_encrypted() || doc.was_encrypted());
    println!("Size: {}", format_size(size));
    if let Some(t) = info_get(&doc, b"Title") {
        if !t.is_empty() {
            println!("Title: {}", t);
        }
    }
    if let Some(t) = info_get(&doc, b"Author") {
        if !t.is_empty() {
            println!("Author: {}", t);
        }
    }
    if let Some(t) = info_get(&doc, b"Subject") {
        if !t.is_empty() {
            println!("Subject: {}", t);
        }
    }
    if let Some(t) = info_get(&doc, b"Keywords") {
        if !t.is_empty() {
            println!("Keywords: {}", t);
        }
    }
    Ok(())
}
