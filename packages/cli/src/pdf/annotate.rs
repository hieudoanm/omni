use crate::pdf::internal::*;
use anyhow::{bail, Result};
use clap::Args;
use lopdf::{dictionary, Object};

#[derive(Args)]
pub struct AnnotateArgs {
    /// PDF file
    pub file: String,
    /// Annotation text
    #[arg(long, short = 't', default_value = "")]
    pub text: String,
    /// Page number for the annotation
    #[arg(long, default_value_t = 1)]
    pub page: u32,
    /// X position in PDF points
    #[arg(long, default_value_t = 100.0)]
    pub x: f64,
    /// Y position in PDF points
    #[arg(long, default_value_t = 100.0)]
    pub y: f64,
    /// Font size
    #[arg(long, default_value_t = 12)]
    pub size: i64,
    /// Output file path (default: overwrite input)
    #[arg(long, short = 'o', default_value = "")]
    pub output: String,
}

pub fn run(args: &AnnotateArgs) -> Result<()> {
    if args.text.is_empty() {
        bail!("--text is required");
    }
    let mut doc = load(&args.file)?;
    let out = output_or(&args.file, &args.output);
    let pages = doc.get_pages();
    let Some(&pid) = pages.get(&args.page) else {
        bail!("page {} out of bounds", args.page);
    };
    let annot = dictionary! {
        "Type" => "Annot",
        "Subtype" => "FreeText",
        "Rect" => vec![
            Object::Real(args.x as f32), Object::Real(args.y as f32),
            Object::Real((args.x + 200.0) as f32), Object::Real((args.y + 30.0) as f32),
        ],
        "Contents" => Object::string_literal(args.text.as_str()),
        "DA" => Object::string_literal(format!("/Helv {} Tf 0 g", args.size).as_str()),
        "F" => 4,
    };
    let aid = doc.add_object(annot);
    let page = page_dict_mut(&mut doc, pid)?;
    let mut annots = page
        .get(b"Annots")
        .ok()
        .and_then(|o| o.as_array().ok())
        .cloned()
        .unwrap_or_default();
    annots.push(Object::Reference(aid));
    page.set("Annots", Object::Array(annots));
    save(&mut doc, &out)?;
    println!("Added annotation to page {} of {}", args.page, out);
    Ok(())
}
