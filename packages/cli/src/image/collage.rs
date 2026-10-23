use super::internal;
use anyhow::Result;
use clap::Args;
use image::{imageops::overlay, Rgba, RgbaImage};

#[derive(Args)]
pub struct CollageArgs {
    /// Input image files
    pub files: Vec<String>,
    /// Number of rows (0 for auto)
    #[arg(long, short = 'r', default_value_t = 0)]
    pub rows: usize,
    /// Number of columns
    #[arg(long, short = 'c', default_value_t = 2)]
    pub cols: usize,
    /// Output file path
    #[arg(long, short = 'o', default_value = "")]
    pub output: String,
}

#[derive(serde::Serialize)]
struct CollageResult {
    status: &'static str,
    output: String,
    images: usize,
    rows: usize,
    cols: usize,
    width: u32,
    height: u32,
}

pub fn run(args: &CollageArgs, json: bool) -> Result<()> {
    if args.files.is_empty() {
        anyhow::bail!("no input files provided");
    }
    let imgs: Vec<_> = args
        .files
        .iter()
        .map(|f| internal::open_image(f))
        .collect::<Result<_>>()?;
    let n = imgs.len();
    let cols = args.cols.max(1);
    let rows = if args.rows == 0 {
        n.div_ceil(cols)
    } else {
        args.rows
    };
    let (mut cell_w, mut cell_h) = (0u32, 0u32);
    for img in &imgs {
        cell_w = cell_w.max(img.width());
        cell_h = cell_h.max(img.height());
    }
    let mut dst = RgbaImage::from_pixel(
        cols as u32 * cell_w,
        rows as u32 * cell_h,
        Rgba([0, 0, 0, 0]),
    );
    for (i, img) in imgs.iter().enumerate() {
        if i >= rows * cols {
            break;
        }
        let row = i / cols;
        let col = i % cols;
        let fitted = fit_within(img, cell_w, cell_h);
        let x = (col as u32 * cell_w) as i64 + (cell_w as i64 - fitted.width() as i64) / 2;
        let y = (row as u32 * cell_h) as i64 + (cell_h as i64 - fitted.height() as i64) / 2;
        overlay(&mut dst, &fitted, x, y);
    }
    let out_path = if args.output.is_empty() {
        internal::default_output(&args.files[0], "_collage")
    } else {
        args.output.clone()
    };
    internal::save_image(&dst, &out_path)?;
    if json {
        println!(
            "{}",
            serde_json::to_string(&CollageResult {
                status: "ok",
                output: out_path,
                images: n,
                rows,
                cols,
                width: dst.width(),
                height: dst.height(),
            })?
        );
    } else {
        println!("{out_path}");
    }
    Ok(())
}

fn fit_within(img: &internal::RgbaImg, w: u32, h: u32) -> internal::RgbaImg {
    let (iw, ih) = img.dimensions();
    let scale = (w as f64 / iw as f64).min(h as f64 / ih as f64);
    let nw = ((iw as f64 * scale).round() as u32).max(1);
    let nh = ((ih as f64 * scale).round() as u32).max(1);
    image::imageops::resize(img, nw, nh, image::imageops::FilterType::Lanczos3)
}
