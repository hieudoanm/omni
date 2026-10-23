use super::internal::Hcl;
use anyhow::Result;
use clap::Args;

#[derive(Args)]
pub struct HclArgs {}

fn read_f64(prompt: &str) -> f64 {
    super::read_line(prompt).parse().unwrap_or(0.0)
}

pub fn run(_args: &HclArgs, json: bool) -> Result<()> {
    let h = read_f64("Hue (0–360)      : ");
    let c = read_f64("Chroma (0–100)   : ");
    let l = read_f64("Lightness (0–100): ");
    let hcl = Hcl { h, c, l };
    let (r, g, b) = hcl.to_rgb().unwrap_or((0, 0, 0));
    if json {
        let hex = hcl.to_hex().unwrap_or_default();
        let rgb = super::internal::Rgb { r, g, b };
        let (ol, oc, oh) = rgb.to_oklch().unwrap_or((0.0, 0.0, 0.0));
        println!(
            "{}",
            serde_json::to_string_pretty(&serde_json::json!({
                "hex": hex,
                "rgb": format!("rgb({r}, {g}, {b})"),
                "hcl": format!("h={h:.2}°, c={c:.2}, l={l:.2}"),
                "oklch": format!("L={ol:.3}, C={oc:.3}, H={oh:.2}°"),
            }))?
        );
    } else {
        let mut out = String::new();
        match hcl.to_rgb() {
            Ok(_) => {}
            Err(e) => {
                out.push_str(&format!("Error (RGB)  : {e}\n"));
                print!("{}", out.trim_end());
                return Ok(());
            }
        }
        let rgb = super::internal::Rgb { r, g, b };
        match rgb.to_hex() {
            Ok(hex) => out.push_str(&format!("HEX    : {hex}\n")),
            Err(e) => out.push_str(&format!("Error (HEX)  : {e}\n")),
        }
        if !rgb.is_valid() {
            out.push_str("Error (RGB)  : invalid RGB values\n");
        } else {
            out.push_str(&format!("RGB    : rgb({r}, {g}, {b})\n"));
        }
        match rgb.to_hsl() {
            Ok((hh, ss, ll)) if hh >= 0.0 && ss >= 0.0 && ll >= 0.0 => {
                out.push_str(&format!("HSL    : h={hh:.2}°, s={ss:.2}%, l={ll:.2}%\n"))
            }
            _ => out.push_str("Error (HSL)  : conversion failed\n"),
        }
        match rgb.to_oklch() {
            Ok((ol, oc, oh)) if ol >= 0.0 && oc >= 0.0 && oh >= 0.0 => {
                out.push_str(&format!("OKLCH  : L={ol:.3}, C={oc:.3}, H={oh:.2}°\n"))
            }
            _ => out.push_str("Error (OKLCH): conversion failed\n"),
        }
        match rgb.to_cmyk() {
            Ok((cy, m, y, k)) if cy >= 0.0 && m >= 0.0 && y >= 0.0 && k >= 0.0 => out.push_str(
                &format!("CMYK   : C={cy:.3}, M={m:.3}, Y={y:.3}, K={k:.3}\n"),
            ),
            _ => out.push_str("Error (CMYK) : conversion failed\n"),
        }
        print!("{}", out.trim_end());
    }
    Ok(())
}
