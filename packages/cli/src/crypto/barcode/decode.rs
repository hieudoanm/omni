use anyhow::{anyhow, Result};
use clap::Args;
use rxing::common::HybridBinarizer;
use rxing::oned::{
    CodaBarReader, Code128Reader, Code39Reader, Code93Reader, EAN13Reader, EAN8Reader, ITFReader,
    UPCAReader, UPCEReader,
};
use rxing::{BarcodeFormat, BinaryBitmap, BufferedImageLuminanceSource, DecodeHints, Reader};
use std::collections::HashSet;

#[derive(Args)]
pub struct DecodeArgs {
    /// Image file containing a barcode
    pub image: String,
}

fn print_result(text: &str, json: bool) -> Result<()> {
    if json {
        println!(
            "{}",
            serde_json::to_string_pretty(&serde_json::json!({"text": text}))?
        );
    } else {
        println!("{text}");
    }
    Ok(())
}

pub fn run(args: &DecodeArgs, json: bool) -> Result<()> {
    let img = image::open(&args.image).map_err(|e| anyhow!("decoding image: {e}"))?;
    let mut bitmap =
        BinaryBitmap::new(HybridBinarizer::new(BufferedImageLuminanceSource::new(img)));

    // Try each reader in Go's order: code128, code39, code93, codabar, ean13, ean8, upca, upce, itf
    macro_rules! try_reader {
        ($r:expr) => {
            if let Ok(res) = $r.decode(&mut bitmap) {
                return print_result(res.getText(), json);
            }
        };
    }

    try_reader!(Code128Reader);
    try_reader!(Code39Reader::new());
    try_reader!(Code93Reader::new());
    try_reader!(CodaBarReader::new());
    try_reader!(EAN13Reader);
    try_reader!(EAN8Reader);
    try_reader!(UPCAReader::default());
    try_reader!(UPCEReader);
    try_reader!(ITFReader::default());

    // Fall back to MultiFormatReader with all 1D formats
    let formats: HashSet<BarcodeFormat> = [
        BarcodeFormat::CODE_128,
        BarcodeFormat::CODE_39,
        BarcodeFormat::CODE_93,
        BarcodeFormat::CODABAR,
        BarcodeFormat::EAN_13,
        BarcodeFormat::EAN_8,
        BarcodeFormat::UPC_A,
        BarcodeFormat::UPC_E,
        BarcodeFormat::ITF,
    ]
    .into_iter()
    .collect();
    let hints = DecodeHints {
        PossibleFormats: Some(formats),
        TryHarder: Some(true),
        ..Default::default()
    };
    let mut reader = rxing::MultiFormatReader::default();
    reader.set_hints(&hints);
    match reader.decode_with_state(&mut bitmap) {
        Ok(res) => print_result(res.getText(), json),
        Err(e) => Err(anyhow!("decoding barcode: {e}")),
    }
}
