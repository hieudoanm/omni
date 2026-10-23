use super::internal;
use anyhow::Result;
use clap::Args;
use image::{Rgba, RgbaImage};

#[derive(Args)]
pub struct PixelateArgs {
    /// Input image file
    pub file: String,
    /// Pixel block size
    #[arg(long, short = 's', default_value_t = 10)]
    pub size: u32,
    /// Output file path
    #[arg(long, short = 'o', default_value = "")]
    pub output: String,
}

#[derive(serde::Serialize)]
struct PixelResult {
    status: &'static str,
    input: String,
    output: String,
    size: u32,
}

fn pixelate(img: &internal::RgbaImg, size: u32) -> RgbaImage {
    let (w, h) = img.dimensions();
    let size = size.max(1);
    let mut dst = RgbaImage::new(w, h);
    let mut y = 0;
    while y < h {
        let mut x = 0;
        while x < w {
            let (mut tr, mut tg, mut tb, mut ta, mut count) = (0u64, 0u64, 0u64, 0u64, 0u64);
            for dy in 0..size {
                for dx in 0..size {
                    if x + dx < w && y + dy < h {
                        let p = img.get_pixel(x + dx, y + dy).0;
                        tr += p[0] as u64;
                        tg += p[1] as u64;
                        tb += p[2] as u64;
                        ta += p[3] as u64;
                        count += 1;
                    }
                }
            }
            let div = count.max(1);
            let c = Rgba([
                (tr / div) as u8,
                (tg / div) as u8,
                (tb / div) as u8,
                (ta / div) as u8,
            ]);
            for dy in 0..size {
                for dx in 0..size {
                    if x + dx < w && y + dy < h {
                        dst.put_pixel(x + dx, y + dy, c);
                    }
                }
            }
            x += size;
        }
        y += size;
    }
    dst
}

pub fn run(args: &PixelateArgs, json: bool) -> Result<()> {
    let img = internal::open_image(&args.file)?;
    let dst = pixelate(&img, args.size);
    let out_path = if args.output.is_empty() {
        internal::default_output(&args.file, "_pixelated")
    } else {
        args.output.clone()
    };
    internal::save_image(&dst, &out_path)?;
    if json {
        println!(
            "{}",
            serde_json::to_string(&PixelResult {
                status: "ok",
                input: args.file.clone(),
                output: out_path,
                size: args.size,
            })?
        );
    } else {
        println!("{out_path}");
    }
    Ok(())
}
