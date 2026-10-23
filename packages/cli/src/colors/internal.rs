//! Color-space conversions ported from cli.go/src/cmd/colors/internal.
use anyhow::{anyhow, Result};

pub const PI: f64 = std::f64::consts::PI;

fn linearize(u: f64) -> f64 {
    if u <= 0.04045 {
        u / 12.92
    } else {
        ((u + 0.055) / 1.055).powf(2.4)
    }
}

fn delinearize(u: f64) -> f64 {
    if u <= 0.0 {
        0.0
    } else if u >= 1.0 {
        1.0
    } else if u <= 0.0031308 {
        12.92 * u
    } else {
        1.055 * u.powf(1.0 / 2.4) - 0.055
    }
}

fn rgb_to_hsl(r: f64, g: f64, b: f64) -> (f64, f64, f64) {
    let max = r.max(g).max(b);
    let min = r.min(g).min(b);
    let mut h = 0.0;
    let mut s = 0.0;
    let l = (max + min) / 2.0;
    if max != min {
        let d = max - min;
        s = if l > 0.5 {
            d / (2.0 - max - min)
        } else {
            d / (max + min)
        };
        if max == r {
            h = (g - b) / d;
            if g < b {
                h += 6.0;
            }
        } else if max == g {
            h = (b - r) / d + 2.0;
        } else {
            h = (r - g) / d + 4.0;
        }
        h *= 60.0;
    }
    (h, s * 100.0, l * 100.0)
}

fn rgb255_to_oklch(r: i32, g: i32, b: i32) -> (f64, f64, f64) {
    let to_lin = |v: f64| {
        let v = v / 255.0;
        if v <= 0.04045 {
            v / 12.92
        } else {
            ((v + 0.055) / 1.055).powf(2.4)
        }
    };
    let r = to_lin(r as f64);
    let g = to_lin(g as f64);
    let b = to_lin(b as f64);
    let l_ = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
    let m_ = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
    let s_ = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;
    let cl = l_.cbrt();
    let cm = m_.cbrt();
    let cs = s_.cbrt();
    let l = 0.2104542553 * cl + 0.7936177850 * cm - 0.0040720468 * cs;
    let a = 1.9779984951 * cl - 2.4285922050 * cm + 0.4505937099 * cs;
    let bb = 0.0259040371 * cl + 0.7827717662 * cm - 0.8086757660 * cs;
    let c = (a * a + bb * bb).sqrt();
    let mut h = bb.atan2(a) * (180.0 / PI);
    if h < 0.0 {
        h += 360.0;
    }
    (l, c, h)
}

fn rgb255_to_hcl(r: i32, g: i32, b: i32) -> (f64, f64, f64) {
    let r = linearize(r as f64 / 255.0);
    let g = linearize(g as f64 / 255.0);
    let b = linearize(b as f64 / 255.0);
    let x = 0.4124564 * r + 0.3575761 * g + 0.1804375 * b;
    let y = 0.2126729 * r + 0.7151522 * g + 0.0721750 * b;
    let z = 0.0193339 * r + 0.1191920 * g + 0.9503041 * b;
    let f = |t: f64| {
        if t > 0.008856 {
            t.cbrt()
        } else {
            7.787 * t + 16.0 / 116.0
        }
    };
    let fx = f(x / 0.95047);
    let fy = f(y / 1.00000);
    let fz = f(z / 1.08883);
    let l = 116.0 * fy - 16.0;
    let a = 500.0 * (fx - fy);
    let bb = 200.0 * (fy - fz);
    let c = (a * a + bb * bb).sqrt();
    let mut h = bb.atan2(a) * (180.0 / PI);
    if h < 0.0 {
        h += 360.0;
    }
    (h, c, l)
}

fn rgb255_to_cmyk(r: i32, g: i32, b: i32) -> (f64, f64, f64, f64) {
    let r = r as f64 / 255.0;
    let g = g as f64 / 255.0;
    let b = b as f64 / 255.0;
    let k = 1.0 - r.max(g).max(b);
    if k == 1.0 {
        return (0.0, 0.0, 0.0, 1.0);
    }
    (
        (1.0 - r - k) / (1.0 - k),
        (1.0 - g - k) / (1.0 - k),
        (1.0 - b - k) / (1.0 - k),
        k,
    )
}

pub struct Hex(pub String);

impl Hex {
    pub fn to_rgb(&self) -> Result<(i32, i32, i32)> {
        let mut hex = self.0.trim_start_matches('#').to_string();
        if hex.len() == 3 {
            hex = hex.chars().flat_map(|c| [c, c]).collect();
        }
        if hex.len() != 6 {
            return Err(anyhow!("invalid hex length"));
        }
        let r = i32::from_str_radix(&hex[0..2], 16)?;
        let g = i32::from_str_radix(&hex[2..4], 16)?;
        let b = i32::from_str_radix(&hex[4..6], 16)?;
        Ok((r, g, b))
    }

    pub fn to_hsl(&self) -> Result<(f64, f64, f64)> {
        let (r, g, b) = self.to_rgb()?;
        Ok(rgb_to_hsl(
            r as f64 / 255.0,
            g as f64 / 255.0,
            b as f64 / 255.0,
        ))
    }

    pub fn to_hcl(&self) -> Result<(f64, f64, f64)> {
        let (r, g, b) = self.to_rgb()?;
        Ok(rgb255_to_hcl(r, g, b))
    }

    pub fn to_oklch(&self) -> Result<(f64, f64, f64)> {
        let (r, g, b) = self.to_rgb()?;
        Ok(rgb255_to_oklch(r, g, b))
    }

    /// Returns CMYK components in 0..=1 (Go Hex.ToCMYK does not scale to %).
    pub fn to_cmyk(&self) -> Result<(f64, f64, f64, f64)> {
        let (r, g, b) = self.to_rgb()?;
        Ok(rgb255_to_cmyk(r, g, b))
    }
}

pub struct Rgb {
    pub r: i32,
    pub g: i32,
    pub b: i32,
}

impl Rgb {
    pub fn is_valid(&self) -> bool {
        (0..=255).contains(&self.r) && (0..=255).contains(&self.g) && (0..=255).contains(&self.b)
    }

    pub fn to_hex(&self) -> Result<String> {
        if !self.is_valid() {
            return Err(anyhow!("invalid RGB value"));
        }
        Ok(format!("#{:02X}{:02X}{:02X}", self.r, self.g, self.b))
    }

    pub fn to_hsl(&self) -> Result<(f64, f64, f64)> {
        if !self.is_valid() {
            return Err(anyhow!("invalid RGB value"));
        }
        Ok(rgb_to_hsl(
            self.r as f64 / 255.0,
            self.g as f64 / 255.0,
            self.b as f64 / 255.0,
        ))
    }

    /// CMYK components scaled to 0..=100 (Go RGB.ToCMYK multiplies by 100).
    pub fn to_cmyk(&self) -> Result<(f64, f64, f64, f64)> {
        if !self.is_valid() {
            return Err(anyhow!("invalid RGB value"));
        }
        let (c, m, y, k) = rgb255_to_cmyk(self.r, self.g, self.b);
        Ok((c * 100.0, m * 100.0, y * 100.0, k * 100.0))
    }

    pub fn to_hcl(&self) -> Result<(f64, f64, f64)> {
        if !self.is_valid() {
            return Err(anyhow!("invalid RGB value"));
        }
        Ok(rgb255_to_hcl(self.r, self.g, self.b))
    }

    pub fn to_oklch(&self) -> Result<(f64, f64, f64)> {
        if !self.is_valid() {
            return Err(anyhow!("invalid RGB value"));
        }
        Ok(rgb255_to_oklch(self.r, self.g, self.b))
    }
}

/// Go `internal.HSLToHex` — h in degrees, s/l in 0..=1? Go callers pass HSL{H,S,L}
/// where S,L come from ToHSL (0..=100) — HSLToHex uses them raw as fractions!
/// Palette uses ToHSL output (0..100) directly into HSLToHex, which treats
/// s/l as 0..1 fractions — replicate exactly.
pub fn hsl_to_hex(h: f64, s: f64, l: f64) -> String {
    let c = (1.0 - (2.0 * l - 1.0).abs()) * s;
    let x = c * (1.0 - ((h / 60.0) % 2.0 - 1.0).abs());
    let m = l - c / 2.0;
    let (mut r, mut g, mut b) = (0.0, 0.0, 0.0);
    if h < 60.0 {
        r = c;
        g = x;
    } else if h < 120.0 {
        r = x;
        g = c;
    } else if h < 180.0 {
        g = c;
        b = x;
    } else if h < 240.0 {
        g = x;
        b = c;
    } else if h < 300.0 {
        r = x;
        b = c;
    } else {
        r = c;
        b = x;
    }
    let clamp = |v: f64| -> i32 {
        if v < 0.0 {
            0
        } else if v > 255.0 {
            255
        } else {
            (v).round() as i32
        }
    };
    format!(
        "#{:02x}{:02x}{:02x}",
        clamp((r + m) * 255.0),
        clamp((g + m) * 255.0),
        clamp((b + m) * 255.0)
    )
}

/// Go `internal.HSLToRGB` — s/l in 0..=100 (divides by 100 internally).
#[allow(dead_code)]
pub fn hsl_to_rgb(h: f64, s: f64, l: f64) -> (i32, i32, i32) {
    let h = h.rem_euclid(360.0);
    let s = s / 100.0;
    let l = l / 100.0;
    let c = (1.0 - (2.0 * l - 1.0).abs()) * s;
    let x = c * (1.0 - ((h / 60.0) % 2.0 - 1.0).abs());
    let m = l - c / 2.0;
    let (mut r, mut g, mut b) = (0.0, 0.0, 0.0);
    if h < 60.0 {
        r = c;
        g = x;
    } else if h < 120.0 {
        r = x;
        g = c;
    } else if h < 180.0 {
        g = c;
        b = x;
    } else if h < 240.0 {
        g = x;
        b = c;
    } else if h < 300.0 {
        r = x;
        b = c;
    } else {
        r = c;
        b = x;
    }
    (
        ((r + m) * 255.0).round() as i32,
        ((g + m) * 255.0).round() as i32,
        ((b + m) * 255.0).round() as i32,
    )
}

pub struct Hcl {
    pub h: f64,
    pub c: f64,
    pub l: f64,
}

impl Hcl {
    pub fn is_valid(&self) -> bool {
        (0.0..=360.0).contains(&self.h) && (0.0..=100.0).contains(&self.l) && self.c >= 0.0
    }

    pub fn to_rgb(&self) -> Result<(i32, i32, i32)> {
        if !self.is_valid() {
            return Err(anyhow!("invalid HCL"));
        }
        let h_rad = self.h * PI / 180.0;
        let a = self.c * h_rad.cos();
        let b = self.c * h_rad.sin();
        let l = self.l;
        let fy = (l + 16.0) / 116.0;
        let fx = a / 500.0 + fy;
        let fz = fy - b / 200.0;
        let finv = |t: f64| {
            if t * t * t > 0.008856 {
                t * t * t
            } else {
                (t - 16.0 / 116.0) / 7.787
            }
        };
        let x = 0.95047 * finv(fx);
        let y = 1.00000 * finv(fy);
        let z = 1.08883 * finv(fz);
        let r = 3.2404542 * x - 1.5371385 * y - 0.4985314 * z;
        let g = -0.9692660 * x + 1.8760108 * y + 0.0415560 * z;
        let b = 0.0556434 * x - 0.2040259 * y + 1.0572252 * z;
        Ok((
            (delinearize(r) * 255.0).round() as i32,
            (delinearize(g) * 255.0).round() as i32,
            (delinearize(b) * 255.0).round() as i32,
        ))
    }

    pub fn to_hex(&self) -> Result<String> {
        let (r, g, b) = self.to_rgb()?;
        Ok(format!("#{r:02X}{g:02X}{b:02X}"))
    }
}

pub struct Oklch {
    pub l: f64,
    pub c: f64,
    pub h: f64,
}

impl Oklch {
    pub fn is_valid(&self) -> bool {
        (0.0..=1.0).contains(&self.l) && self.c >= 0.0 && (0.0..=360.0).contains(&self.h)
    }

    pub fn to_rgb(&self) -> Result<(i32, i32, i32)> {
        if !self.is_valid() {
            return Err(anyhow!("invalid OKLCH"));
        }
        let h_rad = self.h * PI / 180.0;
        let a = self.c * h_rad.cos();
        let b = self.c * h_rad.sin();
        let l_ = self.l + 0.3963377774 * a + 0.2158037573 * b;
        let m_ = self.l - 0.1055613458 * a - 0.0638541728 * b;
        let s_ = self.l - 0.0894841775 * a - 1.2914855480 * b;
        let cl = l_.cbrt();
        let cm = m_.cbrt();
        let cs = s_.cbrt();
        let r = 4.0767416621 * cl - 3.3077115913 * cm + 0.2309699292 * cs;
        let g = -1.2684380046 * cl + 2.6097574011 * cm - 0.3413193965 * cs;
        let b = -0.0041960863 * cl - 0.7034186147 * cm + 1.7076147010 * cs;
        Ok((
            (delinearize(r) * 255.0).round() as i32,
            (delinearize(g) * 255.0).round() as i32,
            (delinearize(b) * 255.0).round() as i32,
        ))
    }

    pub fn to_hex(&self) -> Result<String> {
        let (r, g, b) = self.to_rgb()?;
        Ok(format!("#{r:02X}{g:02X}{b:02X}"))
    }
}

#[allow(dead_code)]
pub struct Cmyk {
    pub c: f64,
    pub m: f64,
    pub y: f64,
    pub k: f64,
}

#[allow(dead_code)]
impl Cmyk {
    pub fn is_valid(&self) -> bool {
        (0.0..=100.0).contains(&self.c)
            && (0.0..=100.0).contains(&self.m)
            && (0.0..=100.0).contains(&self.y)
            && (0.0..=100.0).contains(&self.k)
    }

    pub fn to_rgb(&self) -> Result<(i32, i32, i32)> {
        if !self.is_valid() {
            return Err(anyhow!("invalid CMYK"));
        }
        let c = self.c / 100.0;
        let m = self.m / 100.0;
        let y = self.y / 100.0;
        let k = self.k / 100.0;
        let rf = 1.0 - (c * (1.0 - k) + k).min(1.0);
        let gf = 1.0 - (m * (1.0 - k) + k).min(1.0);
        let bf = 1.0 - (y * (1.0 - k) + k).min(1.0);
        Ok((
            (rf * 255.0).round() as i32,
            (gf * 255.0).round() as i32,
            (bf * 255.0).round() as i32,
        ))
    }

    pub fn to_hex(&self) -> Result<String> {
        let (r, g, b) = self.to_rgb()?;
        Ok(format!("#{r:02X}{g:02X}{b:02X}"))
    }
}

pub fn is_valid_hex(hex: &str) -> bool {
    let h = hex.trim();
    let h = h.strip_prefix('#').unwrap_or(h);
    (h.len() == 6 || h.len() == 3) && h.chars().all(|c| c.is_ascii_hexdigit())
}

pub fn random_hex() -> String {
    use rand::RngExt;
    let mut rng = rand::rng();
    format!(
        "#{:02X}{:02X}{:02X}",
        rng.random_range(0..256),
        rng.random_range(0..256),
        rng.random_range(0..256)
    )
}
