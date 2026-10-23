use crate::pdf::internal::*;
use anyhow::{bail, Result};
use clap::Args;

#[derive(Args)]
pub struct ToImagesArgs {
    /// PDF file
    pub file: String,
    /// Output image format (png or jpg)
    #[arg(long, default_value = "png")]
    pub format: String,
    /// Image resolution in DPI
    #[arg(long, default_value_t = 150)]
    pub dpi: i64,
    /// Output directory (default: <file>_images/)
    #[arg(long, short = 'o', default_value = "")]
    pub output: String,
}

pub fn run(args: &ToImagesArgs) -> Result<()> {
    if args.format != "png" && args.format != "jpg" && args.format != "jpeg" {
        bail!("format must be png or jpg");
    }
    let data = std::fs::read(&args.file)
        .map_err(|e| anyhow::anyhow!("cannot read {}: {:?}", args.file, e))?;
    let pdf = hayro_syntax::Pdf::new(data)
        .map_err(|e| anyhow::anyhow!("cannot parse {}: {:?}", args.file, e))?;
    let pages = pdf.pages();
    if pages.is_empty() {
        bail!("no pages found");
    }
    let dir = if args.output.is_empty() {
        format!("{}_images", args.file.trim_end_matches(".pdf"))
    } else {
        args.output.clone()
    };
    std::fs::create_dir_all(&dir)?;
    let scale = (args.dpi as f32) / 72.0;
    let cache = hayro::RenderCache::new();
    let settings = hayro_interpret::InterpreterSettings::default();
    let rs = hayro::RenderSettings::default();
    let ps = hayro::PixmapSettings {
        x_scale: scale,
        y_scale: scale,
        ..Default::default()
    };
    for (i, page) in pages.iter().enumerate() {
        let pixmap = hayro::render(page, &cache, &settings, &rs, &ps);
        let rgba = pixmap.data_as_u8_slice();
        let img = image::RgbaImage::from_raw(
            pixmap.width() as u32,
            pixmap.height() as u32,
            rgba.to_vec(),
        )
        .ok_or_else(|| anyhow::anyhow!("pixmap conversion failed"))?;
        let out = format!(
            "{}/{}-{:03}.{}",
            dir.trim_end_matches('/'),
            stem(&args.file),
            i + 1,
            args.format
        );
        img.save(&out)
            .map_err(|e| anyhow::anyhow!("cannot write {}: {}", out, e))?;
    }
    println!("Exported images to {}", dir);
    Ok(())
}
