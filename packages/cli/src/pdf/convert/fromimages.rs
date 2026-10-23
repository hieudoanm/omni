use crate::pdf::internal::*;
use anyhow::{bail, Result};
use clap::Args;
use lopdf::{dictionary, Object, Stream};
use std::path::Path;

#[derive(Args)]
pub struct FromImagesArgs {
    /// Image files (png, jpg)
    pub files: Vec<String>,
    /// Output PDF file path
    #[arg(long, short = 'o', default_value = "output.pdf")]
    pub output: String,
}

fn is_jpeg(path: &str) -> bool {
    matches!(
        Path::new(path)
            .extension()
            .and_then(|e| e.to_str())
            .map(|e| e.to_lowercase())
            .as_deref(),
        Some("jpg") | Some("jpeg")
    )
}

pub fn run(args: &FromImagesArgs) -> Result<()> {
    if args.files.is_empty() {
        bail!("at least one image file required");
    }
    let mut doc = blank_document(612.0, 792.0);
    for f in &args.files {
        let (pw, ph, _dict, obj) = if is_jpeg(f) {
            let data = std::fs::read(f).map_err(|e| anyhow::anyhow!("cannot read {}: {}", f, e))?;
            let img = image::load_from_memory(&data)
                .map_err(|e| anyhow::anyhow!("cannot decode {}: {}", f, e))?;
            let (w, h) = (img.width() as i64, img.height() as i64);
            let xobj = dictionary! {
                "Type" => "XObject",
                "Subtype" => "Image",
                "Width" => w,
                "Height" => h,
                "ColorSpace" => "DeviceRGB",
                "BitsPerComponent" => 8,
                "Filter" => "DCTDecode",
            };
            (
                w as f64,
                h as f64,
                xobj.clone(),
                Object::Stream(Stream::new(xobj, data)),
            )
        } else {
            let img = image::open(f)
                .map_err(|e| anyhow::anyhow!("cannot open {}: {}", f, e))?
                .to_rgb8();
            let (w, h) = (img.width() as i64, img.height() as i64);
            let raw = img.into_raw();
            let mut enc = flate2::write::ZlibEncoder::new(Vec::new(), flate2::Compression::fast());
            use std::io::Write;
            enc.write_all(&raw)?;
            let compressed = enc.finish()?;
            let dict = dictionary! {
                "Type" => "XObject",
                "Subtype" => "Image",
                "Width" => w,
                "Height" => h,
                "ColorSpace" => "DeviceRGB",
                "BitsPerComponent" => 8,
                "Filter" => "FlateDecode",
            };
            (
                w as f64,
                h as f64,
                dict.clone(),
                Object::Stream(Stream::new(dict, compressed)),
            )
        };
        let xobj_id = doc.add_object(obj);
        let content = format!("q {} 0 0 {} 0 0 cm /Im1 Do Q", trim_num(pw), trim_num(ph));
        let content_id = doc.add_object(Stream::new(dictionary! {}, content.into_bytes()));
        let page_id = doc.add_object(dictionary! {
            "Type" => "Page",
            "Parent" => Object::Null,
            "MediaBox" => vec![0.into(), 0.into(), pw.into(), ph.into()],
            "Resources" => dictionary! {
                "XObject" => dictionary! { "Im1" => Object::Reference(xobj_id) },
            },
            "Contents" => Object::Reference(content_id),
        });
        let kids = kids_list(&mut doc)?;
        let mut nk = kids;
        nk.push(page_id);
        set_kids(&mut doc, &nk)?;
        fix_parents(&mut doc)?;
    }
    save(&mut doc, &args.output)?;
    println!("Created {} from {} image(s)", args.output, args.files.len());
    Ok(())
}

fn kids_list(doc: &mut lopdf::Document) -> Result<Vec<lopdf::ObjectId>> {
    let root = doc
        .trailer
        .get(b"Root")
        .ok()
        .and_then(|o| o.as_reference().ok())
        .ok_or_else(|| anyhow::anyhow!("no catalog"))?;
    let cat = doc.get_object(root)?.as_dict()?.clone();
    let pages = cat.get(b"Pages")?.as_reference()?;
    let pd = doc.get_object(pages)?.as_dict()?.clone();
    let mut out = Vec::new();
    if let Ok(kids) = pd.get(b"Kids").and_then(|o| o.as_array()) {
        for k in kids {
            if let Ok(r) = k.as_reference() {
                out.push(r);
            }
        }
    }
    Ok(out)
}

fn fix_parents(doc: &mut lopdf::Document) -> Result<()> {
    let root = doc
        .trailer
        .get(b"Root")
        .ok()
        .and_then(|o| o.as_reference().ok())
        .ok_or_else(|| anyhow::anyhow!("no catalog"))?;
    let cat = doc.get_object(root)?.as_dict()?.clone();
    let pages = cat.get(b"Pages")?.as_reference()?;
    let kids = {
        let pd = doc.get_object(pages)?.as_dict()?;
        pd.get(b"Kids")?.as_array()?.clone()
    };
    for k in kids {
        if let Ok(r) = k.as_reference() {
            if let Ok(d) = doc.get_object_mut(r).and_then(|o| o.as_dict_mut()) {
                d.set("Parent", Object::Reference(pages));
            }
        }
    }
    Ok(())
}
