pub mod figma;
pub mod hcl;
pub mod hex;
pub(crate) mod internal;
pub mod oklch;
pub mod palette;
pub mod random;
pub mod rgb;

use anyhow::Result;
use clap::{Args, Subcommand};
use std::io::Write;

#[derive(Args)]
pub struct ColorsArgs {
    #[command(subcommand)]
    pub command: Option<ColorsCommand>,
    /// Output in JSON format
    #[arg(long, short = 'j', global = true)]
    pub json: bool,
}

#[derive(Subcommand)]
pub enum ColorsCommand {
    /// Convert a HEX color to RGB, HSL, HCL, OKLCH, and CMYK
    Hex(hex::HexArgs),
    /// Convert HCL values to HEX, RGB, HSL, OKLCH, and CMYK
    Hcl(hcl::HclArgs),
    /// Convert OKLCH values to HEX, RGB, HSL, HCL, and CMYK
    Oklch(oklch::OklchArgs),
    /// Generate a color palette from a base HEX color
    Palette(palette::PaletteArgs),
    /// Generate random HEX colors with RGB preview
    Random(random::RandomArgs),
    /// Convert RGB values to HEX, HSL, HCL, OKLCH, and CMYK
    Rgb(rgb::RgbArgs),
    /// Figma color palettes: list, look up, and explore
    Figma(figma::FigmaArgs),
}

pub(crate) fn read_line(prompt: &str) -> String {
    print!("{prompt}");
    let _ = std::io::stdout().flush();
    let mut s = String::new();
    let _ = std::io::stdin().read_line(&mut s);
    s.trim().to_string()
}

pub(crate) fn print_hex_conversion(input: &str) -> String {
    use internal::Hex;
    let hex = Hex(input.to_string());
    let mut out = String::new();
    match hex.to_rgb() {
        Ok((r, g, b)) => out.push_str(&format!("RGB    : rgb({r}, {g}, {b})\n")),
        Err(e) => out.push_str(&format!("Error (RGB)  : {e}\n")),
    }
    match hex.to_hsl() {
        Ok((h, s, l)) => out.push_str(&format!("HSL    : h={h:.2}°, s={s:.2}%, l={l:.2}%\n")),
        Err(e) => out.push_str(&format!("Error (HSL)  : {e}\n")),
    }
    match hex.to_hcl() {
        Ok((h, c, l)) => out.push_str(&format!("HCL    : h={h:.2}°, c={c:.2}, l={l:.2}\n")),
        Err(e) => out.push_str(&format!("Error (HCL)  : {e}\n")),
    }
    match hex.to_oklch() {
        Ok((l, c, h)) => out.push_str(&format!("OKLCH  : L={l:.3}, C={c:.3}, H={h:.2}°\n")),
        Err(e) => out.push_str(&format!("Error (OKLCH): {e}\n")),
    }
    match hex.to_cmyk() {
        Ok((c, m, y, k)) => out.push_str(&format!(
            "CMYK   : C={c:.3}, M={m:.3}, Y={y:.3}, K={k:.3}\n"
        )),
        Err(e) => out.push_str(&format!("Error (CMYK) : {e}\n")),
    }
    out.trim_end().to_string()
}

pub(crate) fn print_rgb_conversion(r: i32, g: i32, b: i32) -> String {
    use internal::Rgb;
    let rgb = Rgb { r, g, b };
    let mut out = String::new();
    match rgb.to_hex() {
        Ok(h) => out.push_str(&format!("HEX    : {h}\n")),
        Err(e) => out.push_str(&format!("Error (HEX)  : {e}\n")),
    }
    match rgb.to_hsl() {
        Ok((h, s, l)) => out.push_str(&format!("HSL    : h={h:.2}°, s={s:.2}%, l={l:.2}%\n")),
        Err(e) => out.push_str(&format!("Error (HSL)  : {e}\n")),
    }
    match rgb.to_hcl() {
        Ok((h, c, l)) => out.push_str(&format!("HCL    : h={h:.2}°, c={c:.2}, l={l:.2}\n")),
        Err(e) => out.push_str(&format!("Error (HCL)  : {e}\n")),
    }
    match rgb.to_oklch() {
        Ok((l, c, h)) => out.push_str(&format!("OKLCH  : L={l:.3}, C={c:.3}, H={h:.2}°\n")),
        Err(e) => out.push_str(&format!("Error (OKLCH): {e}\n")),
    }
    match rgb.to_cmyk() {
        Ok((c, m, y, k)) => out.push_str(&format!(
            "CMYK   : C={c:.3}, M={m:.3}, Y={y:.3}, K={k:.3}\n"
        )),
        Err(e) => out.push_str(&format!("Error (CMYK) : {e}\n")),
    }
    out.trim_end().to_string()
}

pub fn run(args: &ColorsArgs) -> Result<()> {
    let json = args.json;
    match &args.command {
        Some(ColorsCommand::Hex(a)) => hex::run(a, json),
        Some(ColorsCommand::Hcl(a)) => hcl::run(a, json),
        Some(ColorsCommand::Oklch(a)) => oklch::run(a, json),
        Some(ColorsCommand::Palette(a)) => palette::run(a, json),
        Some(ColorsCommand::Random(a)) => random::run(a, json),
        Some(ColorsCommand::Rgb(a)) => rgb::run(a, json),
        Some(ColorsCommand::Figma(a)) => figma::run(a, json),
        None => {
            println!("Color conversion and palette generation tools\n");
            println!("Usage:\n  omni colors [command]\n");
            println!("Available Commands:");
            println!("  figma    Figma color palettes: list, look up, and explore");
            println!("  hcl      Convert HCL values to HEX, RGB, HSL, OKLCH, and CMYK");
            println!("  hex      Convert a HEX color to RGB, HSL, HCL, OKLCH, and CMYK");
            println!("  oklch    Convert OKLCH values to HEX, RGB, HSL, HCL, and CMYK");
            println!("  palette  Generate a color palette from a base HEX color");
            println!("  random   Generate random HEX colors with RGB preview");
            println!("  rgb      Convert RGB values to HEX, HSL, HCL, OKLCH, and CMYK");
            Ok(())
        }
    }
}
