use crate::pdf::internal::*;
use anyhow::{bail, Result};
use clap::Args;
use std::collections::BTreeMap;
use std::path::Path;

#[derive(Args)]
pub struct RedactArgs {
    /// PDF file
    pub file: String,
    /// Comma-separated page numbers/ranges to redact (e.g. 1,3-5)
    #[arg(long, short = 'p', default_value = "")]
    pub pages: String,
    /// Region to redact in format page:x,y,w,h (repeatable)
    #[arg(long, short = 'r')]
    pub region: Vec<String>,
    /// Output file path (default: <file>.redacted.pdf)
    #[arg(long, short = 'o', default_value = "")]
    pub output: String,
}

struct Region {
    page: u32,
    x: f64,
    y: f64,
    w: f64,
    h: f64,
}

fn parse_region(s: &str) -> Result<Region> {
    let Some((p, coords)) = s.split_once(':') else {
        bail!("invalid region {} (want page:x,y,w,h)", s);
    };
    let page: u32 = p
        .trim()
        .parse()
        .map_err(|_| anyhow::anyhow!("invalid page in region"))?;
    let vals: Vec<f64> = coords
        .split(',')
        .map(|c| c.trim().parse::<f64>())
        .collect::<Result<_, _>>()
        .map_err(|_| anyhow::anyhow!("invalid region coords {}", coords))?;
    if vals.len() != 4 {
        bail!("invalid region coords {} (want x,y,w,h)", coords);
    }
    Ok(Region {
        page,
        x: vals[0],
        y: vals[1],
        w: vals[2],
        h: vals[3],
    })
}

pub fn run(args: &RedactArgs) -> Result<()> {
    let out = if args.output.is_empty() {
        let ext = Path::new(&args.file)
            .extension()
            .and_then(|e| e.to_str())
            .unwrap_or("");
        let base = args.file.trim_end_matches(&format!(".{}", ext));
        format!("{}.redacted.pdf", base)
    } else {
        args.output.clone()
    };
    if !args.pages.is_empty() && !args.region.is_empty() {
        bail!("use either --pages or --region, not both");
    }
    let mut doc = load(&args.file)?;
    if !args.pages.is_empty() {
        let del = parse_page_spec(&args.pages, page_count(&doc))?;
        let pages = doc.get_pages();
        let keep: Vec<lopdf::ObjectId> = pages
            .iter()
            .filter(|(n, _)| !del.contains(n))
            .map(|(_, id)| *id)
            .collect();
        if keep.is_empty() {
            bail!("cannot delete all pages");
        }
        set_kids(&mut doc, &keep)?;
        save(&mut doc, &out)?;
        println!("Removed pages {} -> {}", args.pages, out);
        return Ok(());
    }
    if args.region.is_empty() {
        bail!("provide --pages or --region");
    }
    let mut by_page: BTreeMap<u32, Vec<String>> = BTreeMap::new();
    for r in &args.region {
        let reg = parse_region(r)?;
        by_page
            .entry(reg.page)
            .or_default()
            .push(fill_rect_op(reg.x, reg.y, reg.w, reg.h));
    }
    let pmap = doc.get_pages();
    for (num, ops) in by_page {
        let Some(&pid) = pmap.get(&num) else {
            bail!("page {} out of bounds", num);
        };
        append_page_ops(&mut doc, pid, &ops.join("\n"))?;
    }
    save(&mut doc, &out)?;
    println!("Redacted {} regions -> {}", args.region.len(), out);
    Ok(())
}
