use super::internal::Oklch;
use anyhow::Result;
use clap::Args;

#[derive(Args)]
pub struct OklchArgs {}

fn read_f64(prompt: &str) -> f64 {
    super::read_line(prompt).parse().unwrap_or(0.0)
}

pub fn run(_args: &OklchArgs, json: bool) -> Result<()> {
    let l = read_f64("Lightness (0–1) : ");
    let c = read_f64("Chroma (0–1)    : ");
    let h = read_f64("Hue (0–360)     : ");
    let oklch = Oklch { l, c, h };
    let (r, g, b) = oklch.to_rgb().unwrap_or((0, 0, 0));
    if json {
        let hex = oklch.to_hex().unwrap_or_default();
        let rgb = super::internal::Rgb { r, g, b };
        let (hh, cc, ll) = rgb.to_hcl().unwrap_or((0.0, 0.0, 0.0));
        println!(
            "{}",
            serde_json::to_string_pretty(&serde_json::json!({
                "hex": hex,
                "rgb": format!("rgb({r}, {g}, {b})"),
                "hcl": format!("h={hh:.2}°, c={cc:.2}, l={ll:.2}"),
                "oklch": format!("L={l:.3}, C={c:.3}, H={h:.2}°"),
            }))?
        );
    } else {
        if let Err(e) = oklch.to_rgb() {
            println!("Error (RGB)  : {e}");
            return Ok(());
        }
        let rgb = super::internal::Rgb { r, g, b };
        let hex = rgb.to_hex().unwrap_or_default();
        let (hh, ss, ll) = rgb.to_hsl().unwrap_or((0.0, 0.0, 0.0));
        let (h2, c2, l2) = rgb.to_hcl().unwrap_or((0.0, 0.0, 0.0));
        let (cy, m, y, k) = rgb.to_cmyk().unwrap_or((0.0, 0.0, 0.0, 0.0));
        println!("HEX    : {hex}");
        println!("RGB    : rgb({r}, {g}, {b})");
        println!("HSL    : h={hh:.2}°, s={ss:.2}%, l={ll:.2}%");
        println!("HCL    : h={h2:.2}°, c={c2:.2}, l={l2:.2}");
        println!("OKLCH  : L={l:.3}, C={c:.3}, H={h:.2}°");
        println!("CMYK   : C={cy:.3}, M={m:.3}, Y={y:.3}, K={k:.3}");
    }
    Ok(())
}
