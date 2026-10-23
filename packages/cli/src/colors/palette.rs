use super::internal::{hsl_to_hex, is_valid_hex, Hex};
use anyhow::Result;
use clap::Args;

const STYLES: [&str; 3] = [
    "Balanced professional (Triadic)",
    "High-contrast (Complementary)",
    "Soft aesthetic (Analogous)",
];

#[derive(Args)]
pub struct PaletteArgs {
    /// palette style: "Balanced professional (Triadic)", "High-contrast (Complementary)", "Soft aesthetic (Analogous)"
    #[arg(long, short = 's', default_value = "")]
    pub style: String,
}

fn hues(h: f64, style: &str) -> (f64, f64, f64) {
    let (mut base, mut support, mut accent) = match style {
        "Balanced professional (Triadic)" => (h, h + 120.0, h + 240.0),
        "High-contrast (Complementary)" => (h, h + 30.0, h + 180.0),
        _ => (h, h - 30.0, h + 30.0),
    };
    for hue in [&mut base, &mut support, &mut accent] {
        while *hue < 0.0 {
            *hue += 360.0;
        }
        while *hue >= 360.0 {
            *hue -= 360.0;
        }
    }
    (base, support, accent)
}

pub fn run(args: &PaletteArgs, json: bool) -> Result<()> {
    let input = super::read_line("Enter base HEX (e.g. #ff6600): ");
    let input = input.trim().to_string();
    if !is_valid_hex(&input) {
        println!("Invalid hex color.");
        return Ok(());
    }
    let hex = Hex(input);
    let mut style = args.style.clone();
    if style.is_empty() {
        println!("Choose palette style:");
        for (i, s) in STYLES.iter().enumerate() {
            println!("  {}) {s}", i + 1);
        }
        let choice = super::read_line("> ");
        let idx: usize = choice.trim().parse().unwrap_or(1);
        style = STYLES
            .get(idx.saturating_sub(1))
            .unwrap_or(&STYLES[0])
            .to_string();
    }
    let (h, s, l) = hex.to_hsl().unwrap_or((0.0, 0.0, 0.0));
    let (base, support, accent) = hues(h, &style);
    if json {
        println!(
            "{}",
            serde_json::to_string_pretty(&serde_json::json!({
                "palette": [
                    hsl_to_hex(base, s, l),
                    hsl_to_hex(support, s, l),
                    hsl_to_hex(accent, s, l),
                ],
            }))?
        );
    } else {
        println!("\nGenerated Palette:");
        println!("Base:    {}  (H={base:.0})", hsl_to_hex(base, s, l));
        println!("Support: {}  (H={support:.0})", hsl_to_hex(support, s, l));
        println!("Accent:  {}  (H={accent:.0})", hsl_to_hex(accent, s, l));
    }
    Ok(())
}
