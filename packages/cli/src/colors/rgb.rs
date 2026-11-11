use anyhow::Result;
use clap::Args;

#[derive(Args)]
pub struct RgbArgs {}

fn read_int(prompt: &str) -> Result<i32> {
    let s = super::read_line(prompt);
    s.parse::<i32>()
        .map_err(|e| anyhow::anyhow!("Error         : {e}"))
}

pub fn run(_args: &RgbArgs, json: bool) -> Result<()> {
    let r = match read_int("R (0-255): ") {
        Ok(v) => v,
        Err(e) => {
            println!("Error (R)    : {e}");
            return Ok(());
        }
    };
    let g = match read_int("G (0-255): ") {
        Ok(v) => v,
        Err(e) => {
            println!("Error (G)    : {e}");
            return Ok(());
        }
    };
    let b = match read_int("B (0-255): ") {
        Ok(v) => v,
        Err(e) => {
            println!("Error (B)    : {e}");
            return Ok(());
        }
    };
    if !(0..=255).contains(&r) || !(0..=255).contains(&g) || !(0..=255).contains(&b) {
        println!("Error        : RGB values must be between 0 and 255");
        return Ok(());
    }
    if json {
        let rgb = super::internal::Rgb { r, g, b };
        let hex = rgb.to_hex().unwrap_or_default();
        let (h, c, l) = rgb.to_hcl().unwrap_or((0.0, 0.0, 0.0));
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
        print!("{}", super::print_rgb_conversion(r, g, b));
    }
    Ok(())
}
