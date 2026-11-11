//! Shared image helpers.
use anyhow::{anyhow, Result};
use image::{DynamicImage, ImageBuffer, Rgba};
use std::io::Write;
use std::path::Path;

pub type RgbaImg = ImageBuffer<Rgba<u8>, Vec<u8>>;

pub fn open_image(path: &str) -> Result<RgbaImg> {
    let img = image::open(path).map_err(|e| anyhow!("open {path}: {e}"))?;
    Ok(img.to_rgba8())
}

pub fn open_dynamic(path: &str) -> Result<DynamicImage> {
    image::open(path).map_err(|e| anyhow!("open {path}: {e}"))
}

pub fn default_output(input: &str, suffix: &str) -> String {
    let p = Path::new(input);
    let stem = p.file_stem().and_then(|s| s.to_str()).unwrap_or("");
    let ext = p.extension().and_then(|s| s.to_str()).unwrap_or("");
    if ext.is_empty() {
        format!("{input}{suffix}")
    } else {
        format!("{}{suffix}.{ext}", p.with_file_name(stem).display())
    }
}

/// Save by file extension like imaging.Save (png/jpg/jpeg/gif).
pub fn save_image(img: &RgbaImg, path: &str) -> Result<()> {
    let ext = std::path::Path::new(path)
        .extension()
        .and_then(|s| s.to_str())
        .unwrap_or("")
        .to_lowercase();
    let f = std::fs::File::create(path).map_err(|e| anyhow!("create {path}: {e}"))?;
    let mut w = std::io::BufWriter::new(f);
    let (w_px, h_px) = img.dimensions();
    let raw = img.as_raw();
    let res: Result<(), anyhow::Error> = match ext.as_str() {
        "png" => image::ImageEncoder::write_image(
            image::codecs::png::PngEncoder::new(&mut w),
            raw,
            w_px,
            h_px,
            image::ExtendedColorType::Rgba8,
        )
        .map_err(|e| anyhow!("encode png: {e}")),
        "jpg" | "jpeg" => {
            let rgb = image::DynamicImage::ImageRgba8(img.clone()).to_rgb8();
            image::ImageEncoder::write_image(
                image::codecs::jpeg::JpegEncoder::new_with_quality(&mut w, 90),
                rgb.as_raw(),
                w_px,
                h_px,
                image::ExtendedColorType::Rgb8,
            )
        }
        .map_err(|e| anyhow!("encode jpeg: {e}")),
        "gif" => image::ImageEncoder::write_image(
            image::codecs::gif::GifEncoder::new(&mut w),
            raw,
            w_px,
            h_px,
            image::ExtendedColorType::Rgba8,
        )
        .map_err(|e| anyhow!("encode gif: {e}")),
        "webp" => img.save(path).map_err(|e| anyhow!("encode webp: {e}")),
        _ => return Err(anyhow!("unsupported format: {ext}")),
    };
    res?;
    w.flush().map_err(|e| anyhow!("write {path}: {e}"))?;
    Ok(())
}

pub fn save_png(img: &RgbaImg, path: &str) -> Result<()> {
    img.save(path).map_err(|e| anyhow!("save {path}: {e}"))
}

/// Parse #rrggbb or a colour name; `default` used on unknown names.
pub fn parse_color(s: &str, default: [u8; 4]) -> [u8; 4] {
    if s.len() == 7 && s.starts_with('#') {
        if let (Ok(r), Ok(g), Ok(b)) = (
            u8::from_str_radix(&s[1..3], 16),
            u8::from_str_radix(&s[3..5], 16),
            u8::from_str_radix(&s[5..7], 16),
        ) {
            return [r, g, b, 255];
        }
    }
    match s.to_lowercase().as_str() {
        "black" => [0, 0, 0, 255],
        "white" => [255, 255, 255, 255],
        "red" => [255, 0, 0, 255],
        "green" => [0, 128, 0, 255],
        "blue" => [0, 0, 255, 255],
        "yellow" => [255, 255, 0, 255],
        "cyan" => [0, 255, 255, 255],
        "magenta" => [255, 0, 255, 255],
        _ => default,
    }
}

/// Draw text with the embedded basicfont 7x13 bitmap font.
/// (x, y) is the top-left of the text block; baseline offset matches Go's
/// font.Drawer with Dot.Y = y + 13 and Ascent = 11.
pub fn draw_text(img: &mut RgbaImg, x: i64, y: i64, text: &str, color: [u8; 4]) {
    let mut cx = x;
    let top = y + 2; // baseline(y+13) - ascent(11)
    for ch in text.chars() {
        let code = ch as usize;
        if (0x20..0x7f).contains(&code) {
            let glyph = code - 0x20;
            for row in 0..super::font7x13::GLYPH_H {
                for col in 0..super::font7x13::GLYPH_W {
                    let a = super::font7x13::MASK[glyph
                        * super::font7x13::GLYPH_H
                        * super::font7x13::GLYPH_W
                        + row * super::font7x13::GLYPH_W
                        + col];
                    if a != 0 {
                        let px = cx + col as i64;
                        let py = top + row as i64;
                        if px >= 0
                            && py >= 0
                            && (px as u32) < img.width()
                            && (py as u32) < img.height()
                        {
                            img.put_pixel(px as u32, py as u32, Rgba(color));
                        }
                    }
                }
            }
        }
        cx += super::font7x13::ADVANCE as i64;
    }
}
