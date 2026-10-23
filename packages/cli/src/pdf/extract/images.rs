use crate::pdf::internal::*;
use anyhow::Result;
use clap::Args;

#[derive(Args)]
pub struct ImagesArgs {
    /// PDF file
    pub file: String,
    /// Output directory (default: <file>_images/)
    #[arg(long, short = 'o', default_value = "")]
    pub output: String,
    /// Image resolution in DPI
    #[arg(long, short = 'r', default_value_t = 150)]
    pub resolution: i64,
}

pub fn run(args: &ImagesArgs) -> Result<()> {
    let dir = if args.output.is_empty() {
        format!("{}_images", args.file.trim_end_matches(".pdf"))
    } else {
        args.output.clone()
    };
    std::fs::create_dir_all(&dir)?;
    // render pages via hayro (matches pdfcpu image extraction intent for scans)
    let data = std::fs::read(&args.file)
        .map_err(|e| anyhow::anyhow!("cannot read {}: {:?}", args.file, e))?;
    let pdf = hayro_syntax::Pdf::new(data)
        .map_err(|e| anyhow::anyhow!("cannot parse {}: {:?}", args.file, e))?;
    let scale = (args.resolution as f32) / 72.0;
    let cache = hayro::RenderCache::new();
    let settings = hayro_interpret::InterpreterSettings::default();
    let rs = hayro::RenderSettings::default();
    let ps = hayro::PixmapSettings {
        x_scale: scale,
        y_scale: scale,
        ..Default::default()
    };
    for (i, page) in pdf.pages().iter().enumerate() {
        let pixmap = hayro::render(page, &cache, &settings, &rs, &ps);
        let img = image::RgbaImage::from_raw(
            pixmap.width() as u32,
            pixmap.height() as u32,
            pixmap.data_as_u8_slice().to_vec(),
        )
        .ok_or_else(|| anyhow::anyhow!("pixmap conversion failed"))?;
        let out = format!(
            "{}/{}-{:03}.png",
            dir.trim_end_matches('/'),
            stem(&args.file),
            i + 1
        );
        img.save(&out)
            .map_err(|e| anyhow::anyhow!("cannot write {}: {}", out, e))?;
    }
    println!("Extracted images to {}", dir);
    Ok(())
}
