use anyhow::{anyhow, Result};
use clap::Args;

#[derive(Args)]
pub struct DecodeArgs {
    /// Image file containing a QR code
    pub image: String,
}

pub fn run(args: &DecodeArgs, json: bool) -> Result<()> {
    let img = image::open(&args.image).map_err(|e| anyhow!("decoding image: {e}"))?;
    let gray = img.to_luma8();
    let (w, h) = gray.dimensions();
    let mut prepared =
        rqrr::PreparedImage::prepare_from_greyscale(w as usize, h as usize, |x, y| {
            gray.get_pixel(x as u32, y as u32)[0]
        });
    let grids = prepared.detect_grids();
    for g in grids.iter() {
        if let Ok((_, content)) = g.decode() {
            if json {
                println!(
                    "{}",
                    serde_json::to_string_pretty(&serde_json::json!({"text": content}))?
                );
            } else {
                println!("{content}");
            }
            return Ok(());
        }
    }
    Err(anyhow!("decoding QR code: not found"))
}
