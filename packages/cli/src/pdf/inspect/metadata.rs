use crate::pdf::internal::*;
use anyhow::Result;
use clap::Args;

#[derive(Args)]
pub struct MetadataArgs {
    /// PDF file
    pub file: String,
    /// Set document title
    #[arg(long, default_value = "")]
    pub title: String,
    /// Set document author
    #[arg(long, default_value = "")]
    pub author: String,
    /// Set document subject
    #[arg(long, default_value = "")]
    pub subject: String,
    /// Set document keywords
    #[arg(long, default_value = "")]
    pub keywords: String,
}

pub fn run(args: &MetadataArgs) -> Result<()> {
    let mut doc = load(&args.file)?;
    let has_setters = [&args.title, &args.author, &args.subject, &args.keywords]
        .iter()
        .any(|s| !s.is_empty());
    if !has_setters {
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
        return Ok(());
    }
    if !args.title.is_empty() {
        info_set(&mut doc, b"Title", &args.title);
    }
    if !args.author.is_empty() {
        info_set(&mut doc, b"Author", &args.author);
    }
    if !args.subject.is_empty() {
        info_set(&mut doc, b"Subject", &args.subject);
    }
    if !args.keywords.is_empty() {
        info_set(&mut doc, b"Keywords", &args.keywords);
    }
    save(&mut doc, &args.file)?;
    println!("Updated metadata for {}", args.file);
    Ok(())
}
