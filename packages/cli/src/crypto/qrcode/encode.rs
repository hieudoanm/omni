use anyhow::{anyhow, Result};
use clap::Args;
use qrcode::{Color, EcLevel, QrCode};

const MODULE_PX: u32 = 8;

#[derive(Args)]
pub struct EncodeArgs {
    /// Text or data to encode
    #[arg(long, short = 'd', default_value = "")]
    pub data: String,
    /// Read data from file
    #[arg(long, short = 'i', default_value = "")]
    pub input: String,
    /// Save QR code as PNG image
    #[arg(long, short = 'o', default_value = "")]
    pub output: String,
    /// Error correction level (L, M, Q, H)
    #[arg(long, short = 'l', default_value = "M")]
    pub level: String,
    /// Quiet zone size in modules
    #[arg(long, short = 'z', default_value_t = 4)]
    pub quiet_zone: usize,
    /// Invert QR code colors
    #[arg(long, short = 'v', default_value_t = false)]
    pub invert: bool,
    /// Positional data
    pub text: Option<String>,
}

fn ec_level(s: &str) -> EcLevel {
    match s.to_uppercase().as_str() {
        "L" => EcLevel::L,
        "Q" => EcLevel::Q,
        "H" => EcLevel::H,
        _ => EcLevel::M,
    }
}

/// Module grid with quiet zone applied: (size, is_dark(x, y)).
fn module_at(code: &QrCode, qz: usize, x: usize, y: usize) -> bool {
    let w = code.width();
    let total = w + 2 * qz;
    if x < qz || y < qz || x >= qz + w || y >= qz + w || x >= total || y >= total {
        return false;
    }
    code.to_colors()[(y - qz) * w + (x - qz)] == Color::Dark
}

pub fn run(args: &EncodeArgs, json: bool) -> Result<()> {
    let mut data = args.data.clone();
    if !args.input.is_empty() {
        data = std::fs::read_to_string(&args.input)
            .map_err(|e| anyhow!("reading input file: {e}"))?
            .trim()
            .to_string();
    }
    if data.is_empty() {
        if let Some(t) = &args.text {
            data = t.clone();
        }
    }
    if data.is_empty() {
        return Err(anyhow!(
            "no data provided; use --data, --input, or pass text as an argument"
        ));
    }

    if json {
        println!(
            "{}",
            serde_json::to_string_pretty(&serde_json::json!({"data": data}))?
        );
        return Ok(());
    }

    let code = QrCode::with_error_correction_level(data.as_bytes(), ec_level(&args.level))
        .map_err(|e| anyhow!("qr encode: {e}"))?;
    let qz = args.quiet_zone;
    let total = code.width() + 2 * qz;
    let dark = |x: usize, y: usize| {
        let d = module_at(&code, qz, x, y);
        if args.invert {
            !d && x >= qz && y >= qz && x < qz + code.width() && y < qz + code.width()
        } else {
            d
        }
    };

    if !args.output.is_empty() {
        let scale = MODULE_PX;
        let size = (total as u32) * scale;
        let mut img = image::GrayImage::new(size, size);
        for y in 0..size {
            for x in 0..size {
                let mx = (x / scale) as usize;
                let my = (y / scale) as usize;
                let v = if dark(mx, my) { 0 } else { 255 };
                img.put_pixel(x, y, image::Luma([v]));
            }
        }
        img.save(&args.output)
            .map_err(|e| anyhow!("writing PNG: {e}"))?;
        return Ok(());
    }

    // Terminal: half-block rendering (▀ = top module, ▄ space = bottom)
    for ty in 0..total.div_ceil(2) {
        let mut line = String::new();
        for tx in 0..total {
            let top = dark(tx, ty * 2);
            let bottom = ty * 2 + 1 < total && dark(tx, ty * 2 + 1);
            match (top, bottom) {
                (true, true) => line.push_str("\x1b[30;40m█"),
                (true, false) => line.push_str("\x1b[37;40m▀"),
                (false, true) => line.push_str("\x1b[30;47m▄"),
                (false, false) => line.push_str("\x1b[37;47m "),
            }
        }
        line.push_str("\x1b[0m");
        println!("{line}");
    }
    Ok(())
}
