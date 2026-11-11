use super::internal;
use anyhow::Result;
use clap::Args;
use image::imageops::crop_imm;
use serde::Serialize;

#[derive(Args)]
pub struct SplitArgs {
    /// Input image file
    pub file: String,
    /// Number of rows
    #[arg(long, short = 'r', default_value_t = 2)]
    pub rows: u32,
    /// Number of columns
    #[arg(long, short = 'c', default_value_t = 2)]
    pub cols: u32,
    /// Output directory
    #[arg(long, short = 'o', default_value = "")]
    pub output: String,
}

#[derive(Serialize)]
struct TileResult {
    tile: String,
    path: String,
    width: u32,
    height: u32,
}

#[derive(Serialize)]
struct SplitResult {
    status: &'static str,
    input: String,
    tiles: Vec<TileResult>,
}

pub fn run(args: &SplitArgs, json: bool) -> Result<()> {
    let img = internal::open_image(&args.file)?;
    let (w, h) = img.dimensions();
    let rows = args.rows.max(1);
    let cols = args.cols.max(1);
    let tile_w = w / cols;
    let tile_h = h / rows;
    let base = if args.output.is_empty() {
        std::path::Path::new(&args.file)
            .parent()
            .map(|p| p.display().to_string())
            .filter(|d| !d.is_empty())
            .unwrap_or_else(|| ".".to_string())
    } else {
        args.output.clone()
    };
    let mut tiles = Vec::new();
    for row in 0..rows {
        for col in 0..cols {
            let x = col * tile_w;
            let y = row * tile_h;
            let tile = crop_imm(&img, x, y, tile_w, tile_h).to_image();
            let name = format!("tile_{row}_{col}.png");
            let tile_path = format!("{base}/{name}");
            internal::save_png(&tile, &tile_path)?;
            tiles.push(TileResult {
                tile: name,
                path: tile_path.clone(),
                width: tile_w,
                height: tile_h,
            });
            if !json {
                println!("{tile_path}");
            }
        }
    }
    if json {
        println!(
            "{}",
            serde_json::to_string(&SplitResult {
                status: "ok",
                input: args.file.clone(),
                tiles,
            })?
        );
    }
    Ok(())
}
