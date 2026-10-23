use super::internal;
use anyhow::Result;
use clap::Args;

#[derive(Args)]
pub struct HexArgs {
    /// Hex color code to look up (with or without #)
    #[arg(long, short = 'x', default_value = "")]
    pub hex: String,
    /// Optional positional hex (Go FlagOrArg)
    #[arg()]
    pub value: Option<String>,
}

fn parse_hex(s: &str) -> Option<(f64, f64, f64)> {
    let h = s.strip_prefix('#').unwrap_or(s);
    if h.len() != 6 {
        return None;
    }
    let r = i32::from_str_radix(&h[0..2], 16).ok()? as f64;
    let g = i32::from_str_radix(&h[2..4], 16).ok()? as f64;
    let b = i32::from_str_radix(&h[4..6], 16).ok()? as f64;
    Some((r, g, b))
}

fn dist(a: (f64, f64, f64), b: (f64, f64, f64)) -> f64 {
    ((a.0 - b.0).powi(2) + (a.1 - b.1).powi(2) + (a.2 - b.2).powi(2)).sqrt()
}

pub fn run(args: &HexArgs, json: bool) -> Result<()> {
    let input = if !args.hex.is_empty() {
        args.hex.trim().to_string()
    } else {
        args.value.clone().unwrap_or_default().trim().to_string()
    };
    if input.is_empty() {
        anyhow::bail!("--hex flag is required");
    }
    let mut hex = input;
    if !hex.starts_with('#') {
        hex = format!("#{hex}");
    }
    let Some(target) = parse_hex(&hex) else {
        anyhow::bail!("invalid hex: {hex}");
    };

    let mut closest_name = "";
    let mut closest_dist = f64::MAX;
    let mut closest_hex = "";
    for (name, h) in internal::all() {
        if let Some(c) = parse_hex(h) {
            let d = dist(target, c);
            if d < closest_dist {
                closest_dist = d;
                closest_name = name;
                closest_hex = h;
            }
        }
    }
    if closest_name.is_empty() {
        anyhow::bail!("invalid hex: {hex}");
    }
    let palettes = internal::find_palettes_by_hex(closest_hex);

    if json {
        println!(
            "{}",
            serde_json::to_string_pretty(&serde_json::json!({
                "input": hex,
                "name": closest_name,
                "hex": closest_hex,
                "distance": (closest_dist * 100.0).round() / 100.0,
                "exact_match": closest_dist == 0.0,
                "palettes": palettes,
            }))?
        );
    } else {
        if closest_dist == 0.0 {
            println!("Exact match: {closest_hex} {closest_name}");
        } else {
            println!("Closest match: {closest_hex} {closest_name} (distance: {closest_dist:.2})");
        }
        if let Some(p) = palettes.first() {
            println!("Palette: {p}");
        }
    }
    Ok(())
}
