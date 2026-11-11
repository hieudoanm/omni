use anyhow::{bail, Context, Result};
use lopdf::{dictionary, Document, Object, ObjectId, Stream};
use std::collections::HashMap;
use std::path::Path;

pub fn load(path: &str) -> Result<Document> {
    Document::load(path).with_context(|| format!("cannot open {}", path))
}

pub fn save(doc: &mut Document, path: &str) -> Result<()> {
    doc.save(path)
        .map(|_| ())
        .with_context(|| format!("cannot write {}", path))
}

pub fn output_or(file: &str, output: &str) -> String {
    if output.is_empty() {
        file.to_string()
    } else {
        output.to_string()
    }
}

pub fn page_count(doc: &Document) -> usize {
    doc.get_pages().len()
}

pub fn parse_page_spec(spec: &str, count: usize) -> Result<Vec<u32>> {
    let mut pages = Vec::new();
    if spec.trim().is_empty() {
        return Ok((1..=count as u32).collect());
    }
    for part in spec.split(',') {
        let part = part.trim();
        if part.is_empty() {
            continue;
        }
        if let Some((a, b)) = part.split_once('-') {
            let start: u32 = a.trim().parse().context("invalid page range")?;
            let end: u32 = if b.trim().is_empty() {
                count as u32
            } else {
                b.trim().parse().context("invalid page range")?
            };
            if start == 0 || end == 0 || start > end || end as usize > count {
                bail!("page range {} out of bounds", part);
            }
            pages.extend(start..=end);
        } else {
            let n: u32 = part.parse().context("invalid page number")?;
            if n == 0 || n as usize > count {
                bail!("page {} out of bounds", n);
            }
            pages.push(n);
        }
    }
    if pages.is_empty() {
        bail!("no pages selected");
    }
    pages.sort_unstable();
    pages.dedup();
    Ok(pages)
}

pub fn page_ids(doc: &Document, spec: &str) -> Result<Vec<ObjectId>> {
    let pages = doc.get_pages();
    Ok(parse_page_spec(spec, pages.len())?
        .into_iter()
        .filter_map(|n| pages.get(&n).copied())
        .collect())
}

pub fn obj_num(o: &Object) -> Option<f64> {
    match o {
        Object::Integer(i) => Some(*i as f64),
        Object::Real(f) => Some(*f as f64),
        _ => None,
    }
}

pub fn page_box(page: &lopdf::Dictionary, key: &[u8], default: [f64; 4]) -> [f64; 4] {
    let arr = page.get(key).ok().and_then(|o| o.as_array().ok());
    let Some(a) = arr else { return default };
    let mut out = [0.0; 4];
    for i in 0..4 {
        out[i] = a.get(i).and_then(obj_num).unwrap_or(default[i]);
    }
    out
}

pub fn full_box(page: &lopdf::Dictionary) -> [f64; 4] {
    let mb = page_box(page, b"MediaBox", [0.0, 0.0, 612.0, 792.0]);
    page_box(page, b"CropBox", mb)
}

pub fn set_page_box(page: &mut lopdf::Dictionary, key: &[u8], b: [f64; 4]) {
    page.set(
        key,
        Object::Array(vec![
            Object::Real(b[0] as f32),
            Object::Real(b[1] as f32),
            Object::Real(b[2] as f32),
            Object::Real(b[3] as f32),
        ]),
    );
}

pub fn page_dict(doc: &Document, id: ObjectId) -> Result<&lopdf::Dictionary> {
    doc.get_object(id)?
        .as_dict()
        .context("page object is not a dictionary")
}

pub fn page_dict_mut(doc: &mut Document, id: ObjectId) -> Result<&mut lopdf::Dictionary> {
    let obj = doc.get_object_mut(id)?;
    obj.as_dict_mut().context("page object is not a dictionary")
}

pub fn trailer_info(doc: &Document) -> Option<&lopdf::Dictionary> {
    let info_id = doc.trailer.get(b"Info").ok()?;
    let id = info_id.as_reference().ok()?;
    doc.get_object(id).ok()?.as_dict().ok()
}

pub fn info_get(doc: &Document, key: &[u8]) -> Option<String> {
    let info = trailer_info(doc)?;
    let obj = info.get(key).ok()?;
    match obj {
        Object::String(s, _) => Some(String::from_utf8_lossy(s).to_string()),
        Object::Name(n) => Some(String::from_utf8_lossy(n).to_string()),
        _ => obj
            .as_str()
            .ok()
            .map(|b| String::from_utf8_lossy(b).to_string()),
    }
}

pub fn info_set(doc: &mut Document, key: &[u8], value: &str) {
    let info_obj = match doc
        .trailer
        .get(b"Info")
        .ok()
        .and_then(|o| o.as_reference().ok())
    {
        Some(id) => Object::Reference(id),
        None => {
            let id = doc.add_object(dictionary! {});
            doc.trailer.set("Info", Object::Reference(id));
            Object::Reference(id)
        }
    };
    if let Ok(id) = info_obj.as_reference() {
        if let Ok(dict) = doc.get_object_mut(id).and_then(|o| o.as_dict_mut()) {
            dict.set(key, Object::string_literal(value));
        }
    }
}

pub fn rotate_page(doc: &mut Document, id: ObjectId, delta: i64) -> Result<()> {
    let page = page_dict_mut(doc, id)?;
    let cur = page
        .get(b"Rotate")
        .ok()
        .and_then(|o| o.as_i64().ok())
        .unwrap_or(0);
    page.set("Rotate", Object::Integer((cur + delta).rem_euclid(360)));
    Ok(())
}

pub fn ensure_font(doc: &mut Document, page_id: ObjectId) -> Result<()> {
    let res_id = {
        let page = page_dict(doc, page_id)?;
        page.get(b"Resources")
            .ok()
            .and_then(|o| o.as_reference().ok())
    };
    let res_id = match res_id {
        Some(r) => r,
        None => {
            let id = doc.add_object(dictionary! {});
            page_dict_mut(doc, page_id)?.set("Resources", Object::Reference(id));
            id
        }
    };
    let font_id = {
        let rd = doc.get_object(res_id)?.as_dict()?;
        rd.get(b"Font").ok().and_then(|o| o.as_reference().ok())
    };
    let font_id = match font_id {
        Some(f) => f,
        None => {
            let id = doc.add_object(dictionary! {});
            doc.get_object_mut(res_id)?
                .as_dict_mut()?
                .set("Font", Object::Reference(id));
            id
        }
    };
    let fd = doc.get_object_mut(font_id)?.as_dict_mut()?;
    fd.set(
        "F_omni",
        Object::Dictionary(dictionary! {
            "Type" => "Font",
            "Subtype" => "Type1",
            "BaseFont" => "Helvetica",
        }),
    );
    Ok(())
}

pub fn pdf_escape(s: &str) -> String {
    let mut out = String::with_capacity(s.len() + 8);
    for c in s.chars() {
        match c {
            '(' | ')' | '\\' => {
                out.push('\\');
                out.push(c);
            }
            c if (c as u32) < 32 || (c as u32) > 126 => {
                out.push('?');
            }
            c => out.push(c),
        }
    }
    out
}

pub fn append_page_ops(doc: &mut Document, page_id: ObjectId, ops: &str) -> Result<()> {
    ensure_font(doc, page_id)?;
    let mut content = doc.get_page_content(page_id);
    content.extend_from_slice(b"\nq\n");
    content.extend_from_slice(ops.as_bytes());
    content.extend_from_slice(b"\nQ\n");
    doc.add_page_contents(page_id, content)?;
    Ok(())
}

pub fn text_op(x: f64, y: f64, size: f64, text: &str) -> String {
    format!(
        "BT /F_omni {} Tf 1 0 0 1 {} {} Tm ({}) Tj ET",
        trim_num(size),
        trim_num(x),
        trim_num(y),
        pdf_escape(text)
    )
}

pub fn fill_rect_op(x: f64, y: f64, w: f64, h: f64) -> String {
    format!(
        "0 g {} {} {} {} re f",
        trim_num(x),
        trim_num(y),
        trim_num(w),
        trim_num(h)
    )
}

pub fn trim_num(v: f64) -> String {
    let s = format!("{:.2}", v);
    s.trim_end_matches('0').trim_end_matches('.').to_string()
}

pub fn clone_pub(
    src: &Document,
    dst: &mut Document,
    id: ObjectId,
    map: &mut HashMap<ObjectId, ObjectId>,
) -> Result<ObjectId> {
    clone_object(dst, src, id, map)
}

fn clone_object(
    dst: &mut Document,
    src: &Document,
    id: ObjectId,
    map: &mut HashMap<ObjectId, ObjectId>,
) -> Result<ObjectId> {
    if let Some(&nid) = map.get(&id) {
        return Ok(nid);
    }
    let obj = src.get_object(id)?.clone();
    let new_id = dst.add_object(Object::Null);
    map.insert(id, new_id);
    let cloned = match obj {
        Object::Dictionary(d) => {
            let mut nd = lopdf::Dictionary::new();
            for (k, v) in d.iter() {
                nd.set(k.clone(), resolve_ref(dst, src, v, map)?);
            }
            Object::Dictionary(nd)
        }
        Object::Array(a) => Object::Array(
            a.iter()
                .map(|v| resolve_ref(dst, src, v, map))
                .collect::<Result<Vec<_>>>()?,
        ),
        Object::Stream(s) => {
            let mut ns = Stream::new(s.dict.clone(), s.content.clone());
            for (k, v) in s.dict.iter() {
                if k == b"Length" {
                    continue;
                }
                ns.dict.set(k.clone(), resolve_ref(dst, src, v, map)?);
            }
            Object::Stream(ns)
        }
        other => other,
    };
    *dst.get_object_mut(new_id)? = cloned;
    Ok(new_id)
}

fn resolve_ref(
    dst: &mut Document,
    src: &Document,
    v: &Object,
    map: &mut HashMap<ObjectId, ObjectId>,
) -> Result<Object> {
    Ok(match v {
        Object::Reference(id) => Object::Reference(clone_object(dst, src, *id, map)?),
        Object::Dictionary(d) => {
            let mut nd = lopdf::Dictionary::new();
            for (k, val) in d.iter() {
                nd.set(k.clone(), resolve_ref(dst, src, val, map)?);
            }
            Object::Dictionary(nd)
        }
        Object::Array(a) => Object::Array(
            a.iter()
                .map(|val| resolve_ref(dst, src, val, map))
                .collect::<Result<Vec<_>>>()?,
        ),
        Object::Stream(s) => {
            let mut ns = Stream::new(s.dict.clone(), s.content.clone());
            for (k, val) in s.dict.iter() {
                if k == b"Length" {
                    continue;
                }
                ns.dict.set(k.clone(), resolve_ref(dst, src, val, map)?);
            }
            Object::Stream(ns)
        }
        other => other.clone(),
    })
}

pub fn import_pages(dst: &mut Document, src: &Document) -> Result<Vec<ObjectId>> {
    let mut map = HashMap::new();
    let mut out = Vec::new();
    for (_num, pid) in src.get_pages() {
        out.push(clone_object(dst, src, pid, &mut map)?);
    }
    Ok(out)
}

pub fn set_kids(dst: &mut Document, kids: &[ObjectId]) -> Result<()> {
    let pages_id = dst
        .trailer
        .get(b"Root")
        .ok()
        .and_then(|o| o.as_reference().ok())
        .context("no catalog")?;
    let catalog = dst.get_object_mut(pages_id)?;
    let cd = catalog.as_dict_mut().context("catalog")?;
    let pages_ref = cd
        .get(b"Pages")
        .ok()
        .and_then(|o| o.as_reference().ok())
        .context("no pages root")?;
    let pobj = dst.get_object_mut(pages_ref)?;
    let pd = pobj.as_dict_mut().context("pages root")?;
    pd.set(
        "Kids",
        Object::Array(kids.iter().map(|id| Object::Reference(*id)).collect()),
    );
    pd.set("Count", Object::Integer(kids.len() as i64));
    Ok(())
}

pub fn blank_document(page_w: f64, page_h: f64) -> Document {
    let mut doc = Document::with_version("1.5");
    let pages_id = doc.add_object(dictionary! {
        "Type" => "Pages",
        "Kids" => Vec::<Object>::new(),
        "Count" => 0,
    });
    let catalog_id = doc.add_object(dictionary! {
        "Type" => "Catalog",
        "Pages" => Object::Reference(pages_id),
    });
    doc.trailer.set("Root", Object::Reference(catalog_id));
    let _ = (page_w, page_h);
    doc
}

pub fn add_blank_page(
    doc: &mut Document,
    width: f64,
    height: f64,
    text: Option<&str>,
) -> Result<ObjectId> {
    let font_id = doc.add_object(dictionary! {
        "Type" => "Font",
        "Subtype" => "Type1",
        "BaseFont" => "Helvetica",
    });
    let resources = dictionary! {
        "Font" => dictionary! { "F1" => Object::Reference(font_id) },
    };
    let content = if let Some(t) = text {
        let lines: Vec<&str> = t.lines().collect();
        let mut ops = String::new();
        for (i, line) in lines.iter().enumerate() {
            let y = height - 72.0 - i as f64 * 18.0;
            ops.push_str(&format!(
                "BT /F1 12 Tf 72 {} Td ({}) Tj ET\n",
                trim_num(y),
                pdf_escape(line)
            ));
        }
        ops
    } else {
        String::new()
    };
    let stream = Stream::new(dictionary! {}, content.into_bytes());
    let content_id = doc.add_object(stream);
    let par = pages_root_id(doc);
    let page_id = doc.add_object(dictionary! {
        "Type" => "Page",
        "Parent" => par.map(Object::Reference).unwrap_or(Object::Null),
        "MediaBox" => vec![0.into(), 0.into(), width.into(), height.into()],
        "Resources" => Object::Dictionary(resources),
        "Contents" => Object::Reference(content_id),
    });
    let kids = kids_of(doc)?;
    let mut new_kids = kids;
    new_kids.push(page_id);
    set_kids(doc, &new_kids)?;
    Ok(page_id)
}

fn pages_root_id(doc: &Document) -> Option<ObjectId> {
    let root = doc.trailer.get(b"Root").ok()?.as_reference().ok()?;
    let catalog = doc.get_object(root).ok()?.as_dict().ok()?;
    catalog.get(b"Pages").ok()?.as_reference().ok()
}

fn kids_of(doc: &Document) -> Result<Vec<ObjectId>> {
    let Some(pid) = pages_root_id(doc) else {
        return Ok(Vec::new());
    };
    let pd = page_dict(doc, pid)?;
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

pub fn stem(path: &str) -> String {
    Path::new(path)
        .file_stem()
        .map(|s| s.to_string_lossy().to_string())
        .unwrap_or_else(|| "output".to_string())
}
