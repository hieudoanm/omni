use crate::pdf::internal::*;
use anyhow::bail;
use anyhow::Result;
use clap::Args;

#[derive(Args)]
pub struct DeleteArgs {
    /// PDF file
    pub file: String,
    /// Pages to delete (e.g. 1,3,5-7)
    #[arg(long, short = 'p', default_value = "")]
    pub pages: String,
    /// Output file path (default: overwrite input)
    #[arg(long, short = 'o', default_value = "")]
    pub output: String,
}

pub fn run(args: &DeleteArgs) -> Result<()> {
    if args.pages.trim().is_empty() {
        bail!("--pages is required");
    }
    let mut doc = load(&args.file)?;
    let out = output_or(&args.file, &args.output);
    let pages = doc.get_pages();
    let del = parse_page_spec(&args.pages, pages.len())?;
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
    println!("Deleted pages [{}] from {}", args.pages, args.file);
    Ok(())
}
