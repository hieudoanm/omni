use anyhow::{anyhow, Result};
use clap::Args;
use rxing::{BarcodeFormat, EncodeHints, MultiFormatWriter, Writer};

#[derive(Args)]
pub struct EncodeArgs {
    /// Text or data to encode
    #[arg(long, short = 'd', default_value = "")]
    pub data: String,
    /// Read data from file
    #[arg(long, short = 'i', default_value = "")]
    pub input: String,
    /// Save barcode as PNG image
    #[arg(long, short = 'o', default_value = "")]
    pub output: String,
    /// Barcode format (code128, code39, code93, codabar, ean13, ean8, upca, upce, itf)
    #[arg(long, short = 'f', default_value = "code128")]
    pub format: String,
    /// Image width in pixels
    #[arg(long, short = 'w', default_value_t = 400)]
    pub width: i32,
    /// Image height in pixels
    #[arg(long, short = 'H', default_value_t = 150)]
    pub height: i32,
    /// Quiet zone in pixels
    #[arg(long, short = 'm', default_value_t = 10)]
    pub margin: i32,
    /// Positional data
    pub text: Option<String>,
}

fn barcode_format(s: &str) -> Result<BarcodeFormat> {
    Ok(match s.to_lowercase().as_str() {
        "code128" => BarcodeFormat::CODE_128,
        "code39" => BarcodeFormat::CODE_39,
        "code93" => BarcodeFormat::CODE_93,
        "codabar" => BarcodeFormat::CODABAR,
        "ean13" => BarcodeFormat::EAN_13,
        "ean8" => BarcodeFormat::EAN_8,
        "upca" => BarcodeFormat::UPC_A,
        "upce" => BarcodeFormat::UPC_E,
        "itf" => BarcodeFormat::ITF,
        other => return Err(anyhow!("unsupported format: {other}")),
    })
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

    let format = barcode_format(&args.format)?;
    let writer = MultiFormatWriter;
    let hints = EncodeHints {
        Margin: Some(args.margin.to_string()),
        ..Default::default()
    };
    let matrix = writer
        .encode_with_hints(&data, &format, args.width, args.height, &hints)
        .map_err(|e| anyhow!("barcode encode: {e}"))?;

    if json {
        println!(
            "{}",
            serde_json::to_string_pretty(&serde_json::json!({
                "format": args.format, "data": data,
            }))?
        );
    }

    if !args.output.is_empty() {
        let mut img = image::RgbImage::new(matrix.width(), matrix.height());
        for y in 0..matrix.height() {
            for x in 0..matrix.width() {
                let v = if matrix.get(x, y) { 0 } else { 255 };
                img.put_pixel(x, y, image::Rgb([v, v, v]));
            }
        }
        img.save(&args.output)
            .map_err(|e| anyhow!("writing PNG: {e}"))?;
        if !json {
            println!("{}", args.output);
        }
        return Ok(());
    }

    for y in 0..matrix.height() {
        let mut line = String::new();
        for x in 0..matrix.width() {
            line.push(if matrix.get(x, y) { '█' } else { ' ' });
        }
        println!("{}", line.trim_end());
    }
    Ok(())
}
