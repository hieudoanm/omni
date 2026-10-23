use anyhow::Result;
use clap::Args;
use serde::Serialize;
use std::collections::HashMap;

#[derive(Args)]
pub struct DominantArgs {
    /// Input image file
    pub file: String,
    /// Number of dominant colours to extract
    #[arg(long, short = 'n', default_value_t = 5)]
    pub top: usize,
}

#[derive(Serialize)]
struct DominantColor {
    hex: String,
    r: u8,
    g: u8,
    b: u8,
    pct: f64,
}

pub fn run(args: &DominantArgs, _json: bool) -> Result<()> {
    let img = super::internal::open_image(&args.file)?;
    let pixel_count = (img.width() * img.height()) as f64;
    let mut map: HashMap<[u8; 4], usize> = HashMap::new();
    for p in img.pixels() {
        *map.entry(p.0).or_insert(0) += 1;
    }
    let mut sorted: Vec<([u8; 4], usize)> = map.into_iter().collect();
    sorted.sort_by_key(|a| std::cmp::Reverse(a.1));
    let top_n = args.top.min(sorted.len());
    sorted.truncate(top_n);
    let colors: Vec<DominantColor> = sorted
        .iter()
        .map(|(c, count)| DominantColor {
            hex: format!("#{:02x}{:02x}{:02x}", c[0], c[1], c[2]),
            r: c[0],
            g: c[1],
            b: c[2],
            pct: *count as f64 / pixel_count * 100.0,
        })
        .collect();
    println!("{}", serde_json::to_string(&colors)?);
    Ok(())
}
