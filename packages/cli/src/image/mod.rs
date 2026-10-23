pub mod background;
pub mod blur;
pub mod border;
pub mod collage;
pub mod combine;
pub mod compress;
pub mod convert;
pub mod crop;
pub mod dominant;
pub mod flip;
pub mod font7x13;
pub mod grayscale;
pub mod icons;
pub mod info;
pub mod internal;
pub mod pixelate;
pub mod resize;
pub mod round;
pub mod sharpen;
pub mod split;
pub mod text;

use anyhow::Result;
use clap::{Args, Subcommand};

#[derive(Args)]
pub struct ImageArgs {
    #[command(subcommand)]
    pub command: Option<ImageCommand>,
    /// Output in JSON format
    #[arg(long, short = 'j', global = true)]
    pub json: bool,
    /// Verbose output
    #[arg(long, short = 'v', global = true)]
    pub verbose: bool,
}

#[derive(Subcommand)]
pub enum ImageCommand {
    /// Replace background with solid color
    Background(background::BackgroundArgs),
    /// Apply gaussian blur
    Blur(blur::BlurArgs),
    /// Add border around image
    Border(border::BorderArgs),
    /// Create collage from multiple images
    Collage(collage::CollageArgs),
    /// Combine two images side by side
    Combine(combine::CombineArgs),
    /// Compress image (reduce file size)
    Compress(compress::CompressArgs),
    /// Convert image format
    Convert(convert::ConvertArgs),
    /// Crop image
    Crop(crop::CropArgs),
    /// Extract dominant colours from an image
    Dominant(dominant::DominantArgs),
    /// Flip/mirror image
    Flip(flip::FlipArgs),
    /// Convert to grayscale
    Grayscale(grayscale::GrayscaleArgs),
    /// Generate app icons in multiple sizes
    Icons(icons::IconsArgs),
    /// Show image metadata
    Info(info::InfoArgs),
    /// Pixelate image
    Pixelate(pixelate::PixelateArgs),
    /// Resize image dimensions
    Resize(resize::ResizeArgs),
    /// Round image corners or make circular
    Round(round::RoundArgs),
    /// Sharpen image
    Sharpen(sharpen::SharpenArgs),
    /// Split image into tiles
    Split(split::SplitArgs),
    /// Add text overlay to image
    Text(text::TextArgs),
}

pub fn run(args: &ImageArgs) -> Result<()> {
    let json = args.json;
    match &args.command {
        Some(ImageCommand::Background(a)) => background::run(a, json),
        Some(ImageCommand::Blur(a)) => blur::run(a, json),
        Some(ImageCommand::Border(a)) => border::run(a, json),
        Some(ImageCommand::Collage(a)) => collage::run(a, json),
        Some(ImageCommand::Combine(a)) => combine::run(a, json),
        Some(ImageCommand::Compress(a)) => compress::run(a, json),
        Some(ImageCommand::Convert(a)) => convert::run(a, json),
        Some(ImageCommand::Crop(a)) => crop::run(a, json),
        Some(ImageCommand::Dominant(a)) => dominant::run(a, json),
        Some(ImageCommand::Flip(a)) => flip::run(a, json),
        Some(ImageCommand::Grayscale(a)) => grayscale::run(a, json),
        Some(ImageCommand::Icons(a)) => icons::run(a, json),
        Some(ImageCommand::Info(a)) => info::run(a, json),
        Some(ImageCommand::Pixelate(a)) => pixelate::run(a, json),
        Some(ImageCommand::Resize(a)) => resize::run(a, json),
        Some(ImageCommand::Round(a)) => round::run(a, json),
        Some(ImageCommand::Sharpen(a)) => sharpen::run(a, json),
        Some(ImageCommand::Split(a)) => split::run(a, json),
        Some(ImageCommand::Text(a)) => text::run(a, json),
        None => {
            println!("Image processing tools\n");
            println!("Usage:\n  omni image [command]\n");
            println!("Available Commands:");
            println!("  background  Replace background with solid color");
            println!("  blur        Apply gaussian blur");
            println!("  border      Add border around image");
            println!("  collage     Create collage from multiple images");
            println!("  combine     Combine two images side by side");
            println!("  compress    Compress image (reduce file size)");
            println!("  convert     Convert image format");
            println!("  crop        Crop image");
            println!("  dominant    Extract dominant colours from an image");
            println!("  flip        Flip/mirror image");
            println!("  grayscale   Convert to grayscale");
            println!("  icons       Generate app icons in multiple sizes");
            println!("  info        Show image metadata");
            println!("  pixelate    Pixelate image");
            println!("  resize      Resize image dimensions");
            println!("  round       Round image corners or make circular");
            println!("  sharpen     Sharpen image");
            println!("  split       Split image into tiles");
            println!("  text        Add text overlay to image");
            Ok(())
        }
    }
}
