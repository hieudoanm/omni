use crate::pdf::internal::*;
use anyhow::{bail, Result};
use clap::Args;
use lopdf::ObjectId;

#[derive(Args)]
pub struct RearrangeArgs {
    /// PDF file
    pub file: String,
    /// Page order (e.g. 3,1,2 or 'reverse')
    #[arg(long, short = 'o', default_value = "")]
    pub order: String,
    /// Output file path
    #[arg(long, short = 'O', default_value = "")]
    pub output: String,
}

pub fn run(args: &RearrangeArgs) -> Result<()> {
    if args.order.is_empty() {
        bail!("--order is required");
    }
    let mut doc = load(&args.file)?;
    let pages = doc.get_pages();
    let count = pages.len();
    let nums: Vec<u32> = pages.keys().copied().collect();
    let order_nums: Vec<u32> = if args.order == "reverse" {
        nums.iter().rev().copied().collect()
    } else {
        parse_page_spec(&args.order, count)?
    };
    let kids: Vec<ObjectId> = order_nums
        .iter()
        .filter_map(|n| pages.get(n).copied())
        .collect();
    if kids.len() != count {
        bail!("order must include every page exactly once");
    }
    set_kids(&mut doc, &kids)?;
    let out = if args.output.is_empty() {
        args.file.clone()
    } else {
        args.output.clone()
    };
    save(&mut doc, &out)?;
    println!("Rearranged pages into {}", out);
    Ok(())
}
