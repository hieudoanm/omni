use super::internal::Hex;
use anyhow::Result;
use clap::Args;

#[derive(Args)]
pub struct HexArgs {}

pub fn run(_args: &HexArgs, json: bool) -> Result<()> {
    let input = super::read_line("HEX: ");
    if json {
        let hex = Hex(input.clone());
        let (r, g, b) = hex.to_rgb().unwrap_or((0, 0, 0));
        let (h, c, l) = hex.to_hcl().unwrap_or((0.0, 0.0, 0.0));
        let (ol, oc, oh) = hex.to_oklch().unwrap_or((0.0, 0.0, 0.0));
        println!(
            "{}",
            serde_json::to_string_pretty(&serde_json::json!({
                "hex": input,
                "rgb": format!("rgb({r}, {g}, {b})"),
                "hcl": format!("h={h:.2}°, c={c:.2}, l={l:.2}"),
                "oklch": format!("L={ol:.3}, C={oc:.3}, H={oh:.2}°"),
            }))?
        );
    } else {
        print!("{}", super::print_hex_conversion(&input));
    }
    Ok(())
}
