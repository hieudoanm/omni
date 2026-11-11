use crate::pdf::internal::*;
use anyhow::Result;
use clap::Args;
use lopdf::ObjectId;
use std::path::Path;

#[derive(Args)]
pub struct SplitArgs {
    /// PDF file
    pub file: String,
    /// Page ranges to extract (e.g. 1-3,5,7-9)
    #[arg(long, short = 'p', default_value = "")]
    pub pages: String,
    /// Output file (with --pages) or directory (default: <file>_split/)
    #[arg(long, short = 'o', default_value = "")]
    pub output: String,
}

fn doc_with_pages(src: &lopdf::Document, ids: &[ObjectId]) -> Result<lopdf::Document> {
    let mut dst = blank_document(612.0, 792.0);
    let mut map = std::collections::HashMap::new();
    let mut out = Vec::new();
    for id in ids {
        out.push(crate::pdf::internal::clone_pub(
            src, &mut dst, *id, &mut map,
        )?);
    }
    set_kids(&mut dst, &out)?;
    Ok(dst)
}

pub fn run(args: &SplitArgs) -> Result<()> {
    let src = load(&args.file)?;
    let pages = src.get_pages();
    let dir = if args.output.is_empty() {
        format!("{}_split", args.file.trim_end_matches(".pdf"))
    } else {
        args.output.clone()
    };
    if !args.pages.is_empty() {
        let ids = page_ids(&src, &args.pages)?;
        let out = if Path::new(&dir).extension().is_some() || dir.ends_with(".pdf") {
            dir.clone()
        } else {
            format!("{}/extracted.pdf", dir.trim_end_matches('/'))
        };
        let mut d = doc_with_pages(&src, &ids)?;
        save(&mut d, &out)?;
        println!("Extracted pages [{}] to {}", args.pages, out);
        return Ok(());
    }
    std::fs::create_dir_all(&dir)?;
    for (num, id) in &pages {
        let mut d = doc_with_pages(&src, &[*id])?;
        let out = format!(
            "{}/{}-{:03}.pdf",
            dir.trim_end_matches('/'),
            stem(&args.file),
            num
        );
        save(&mut d, &out)?;
    }
    println!("Split {} into pages in {}", args.file, dir);
    Ok(())
}
