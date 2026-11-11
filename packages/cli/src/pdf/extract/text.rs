use crate::pdf::cmap::CMap;
use crate::pdf::internal::*;
use anyhow::Result;
use clap::Args;
use lopdf::Document;
use std::collections::HashMap;

#[derive(Args)]
pub struct TextArgs {
    /// PDF file
    pub file: String,
}

#[derive(Debug)]
enum Operand {
    Str(Vec<u8>),
    Name(Vec<u8>),
    Num,
    Arr(Vec<Operand>),
}

#[derive(Debug)]
enum Tok {
    Str(Vec<u8>),
    Name(Vec<u8>),
    Num,
    ArrStart,
    ArrEnd,
    Op(String),
}

fn is_delim(b: u8) -> bool {
    matches!(
        b,
        b' ' | b'\t'
            | b'\n'
            | b'\r'
            | 0x0c
            | 0
            | b'('
            | b')'
            | b'<'
            | b'>'
            | b'['
            | b']'
            | b'{'
            | b'}'
            | b'/'
    )
}

fn skip_ws(content: &[u8], mut i: usize) -> usize {
    loop {
        while i < content.len() && content[i].is_ascii_whitespace() {
            i += 1;
        }
        if i < content.len() && content[i] == b'%' {
            while i < content.len() && content[i] != b'\n' {
                i += 1;
            }
        } else {
            return i;
        }
    }
}

/// Unescape a PDF literal string body into raw bytes (character codes).
fn unescape_literal(body: &[u8]) -> Vec<u8> {
    let mut out = Vec::with_capacity(body.len());
    let mut i = 0;
    while i < body.len() {
        if body[i] == b'\\' && i + 1 < body.len() {
            i += 1;
            match body[i] {
                b'n' => out.push(b'\n'),
                b'r' => out.push(b'\r'),
                b't' => out.push(b'\t'),
                b'b' => out.push(8),
                b'f' => out.push(12),
                b'(' | b')' | b'\\' => out.push(body[i]),
                b'\n' => {}
                b'\r' => {
                    if i + 1 < body.len() && body[i + 1] == b'\n' {
                        i += 1;
                    }
                }
                c @ b'0'..=b'7' => {
                    let mut val = (c - b'0') as u32;
                    let mut n = 1;
                    while n < 3 && i + 1 < body.len() && (b'0'..=b'7').contains(&body[i + 1]) {
                        i += 1;
                        val = val * 8 + (body[i] - b'0') as u32;
                        n += 1;
                    }
                    out.push(val as u8);
                }
                c => out.push(c),
            }
            i += 1;
        } else {
            out.push(body[i]);
            i += 1;
        }
    }
    out
}

fn hex_string_bytes(hex: &[u8]) -> Vec<u8> {
    let mut nibbles = Vec::new();
    for &c in hex {
        match c {
            b'0'..=b'9' => nibbles.push(c - b'0'),
            b'a'..=b'f' => nibbles.push(c - b'a' + 10),
            b'A'..=b'F' => nibbles.push(c - b'A' + 10),
            _ => {}
        }
    }
    let mut bytes = Vec::new();
    for pair in nibbles.chunks(2) {
        let hi = pair[0];
        let lo = *pair.get(1).unwrap_or(&0);
        bytes.push((hi << 4) | lo);
    }
    bytes
}

fn tokenize(content: &[u8]) -> Vec<Tok> {
    let mut toks = Vec::new();
    let mut i = 0;
    while i < content.len() {
        i = skip_ws(content, i);
        if i >= content.len() {
            break;
        }
        match content[i] {
            b'(' => {
                let start = i + 1;
                let mut depth = 1;
                let mut j = start;
                while j < content.len() && depth > 0 {
                    match content[j] {
                        b'\\' => j += 1,
                        b'(' => depth += 1,
                        b')' => depth -= 1,
                        _ => {}
                    }
                    j += 1;
                }
                if depth == 0 {
                    toks.push(Tok::Str(unescape_literal(&content[start..j - 1])));
                }
                i = j;
            }
            b'<' => {
                if i + 1 < content.len() && content[i + 1] == b'<' {
                    i += 2;
                    continue;
                }
                let mut j = i + 1;
                let mut hex = Vec::new();
                while j < content.len() && content[j] != b'>' {
                    hex.push(content[j]);
                    j += 1;
                }
                if j < content.len() {
                    toks.push(Tok::Str(hex_string_bytes(&hex)));
                }
                i = j + 1;
            }
            b'/' => {
                let start = i + 1;
                let mut j = start;
                while j < content.len() && !is_delim(content[j]) {
                    j += 1;
                }
                toks.push(Tok::Name(content[start..j].to_vec()));
                i = j;
            }
            b'[' => {
                toks.push(Tok::ArrStart);
                i += 1;
            }
            b']' => {
                toks.push(Tok::ArrEnd);
                i += 1;
            }
            b'{' | b'}' => i += 1,
            _ => {
                let start = i;
                while i < content.len() && !is_delim(content[i]) {
                    i += 1;
                }
                let word = &content[start..i];
                if !word.is_empty()
                    && word
                        .iter()
                        .all(|b| b.is_ascii_digit() || matches!(b, b'.' | b'-' | b'+'))
                {
                    toks.push(Tok::Num);
                } else {
                    toks.push(Tok::Op(String::from_utf8_lossy(word).into_owned()));
                }
            }
        }
    }
    toks
}

fn font_cmap(doc: &Document, font: &lopdf::Dictionary) -> Option<CMap> {
    let resolve = |d: &lopdf::Dictionary| -> Option<CMap> {
        let obj = d.get(b"ToUnicode").ok()?.as_reference().ok()?;
        let stream = doc.get_object(obj).ok()?.as_stream().ok()?;
        let data = stream
            .decompressed_content()
            .unwrap_or_else(|_| stream.content.clone());
        CMap::parse(&data)
    };
    if let Some(cmap) = resolve(font) {
        return Some(cmap);
    }
    if let Ok(desc) = font.get(b"DescendantFonts") {
        if let Ok(arr) = desc.as_array() {
            for item in arr {
                if let Ok(r) = item.as_reference() {
                    if let Ok(d) = doc.get_dictionary(r) {
                        if let Some(cmap) = resolve(d) {
                            return Some(cmap);
                        }
                    }
                }
            }
        }
    }
    None
}

fn decode_bytes(bytes: &[u8], cmap: Option<&CMap>) -> String {
    match cmap {
        Some(c) => c.decode(bytes),
        None => bytes
            .iter()
            .map(|&b| if b < 128 { b as char } else { '?' })
            .collect(),
    }
}

fn push_str(out: &mut String, pending_space: &mut bool, bytes: &[u8], cmap: Option<&CMap>) {
    let decoded = decode_bytes(bytes, cmap);
    if decoded.is_empty() {
        return;
    }
    if *pending_space && !out.ends_with(|c: char| c.is_whitespace()) {
        out.push(' ');
    }
    out.push_str(&decoded);
    *pending_space = true;
}

fn run_page(doc: &Document, pid: lopdf::ObjectId) -> String {
    let Ok(fonts_map) = doc.get_page_fonts(pid) else {
        return String::new();
    };
    let mut fonts: HashMap<Vec<u8>, Option<CMap>> = HashMap::new();
    for (name, fdict) in fonts_map {
        fonts.insert(name, font_cmap(doc, fdict));
    }
    let content = doc.get_page_content(pid);
    let toks = tokenize(&content);

    let mut out = String::new();
    let mut stack: Vec<Operand> = Vec::new();
    let mut arr: Option<Vec<Operand>> = None;
    let mut current_font: Vec<u8> = Vec::new();
    let mut pending_space = false;

    for tok in toks {
        match tok {
            Tok::Str(b) => {
                if let Some(a) = arr.as_mut() {
                    a.push(Operand::Str(b));
                } else {
                    stack.push(Operand::Str(b));
                }
            }
            Tok::Name(n) => {
                if arr.is_some() {
                    continue;
                }
                stack.push(Operand::Name(n));
            }
            Tok::Num => {
                if arr.is_some() {
                    continue;
                }
                stack.push(Operand::Num);
            }
            Tok::ArrStart => arr = Some(Vec::new()),
            Tok::ArrEnd => {
                if let Some(items) = arr.take() {
                    stack.push(Operand::Arr(items));
                }
            }
            Tok::Op(op) => {
                match op.as_str() {
                    "Tf" => {
                        if let Some(Operand::Num) = stack.pop() {
                            if let Some(Operand::Name(n)) = stack.pop() {
                                current_font = n;
                            }
                        }
                    }
                    "Tj" => {
                        if let Some(Operand::Str(b)) = stack.pop() {
                            let cmap = fonts.get(&current_font).and_then(|c| c.as_ref());
                            push_str(&mut out, &mut pending_space, &b, cmap);
                        }
                    }
                    "TJ" => {
                        if let Some(Operand::Arr(items)) = stack.pop() {
                            let cmap = fonts.get(&current_font).and_then(|c| c.as_ref());
                            for item in items {
                                if let Operand::Str(b) = item {
                                    push_str(&mut out, &mut pending_space, &b, cmap);
                                }
                            }
                        }
                    }
                    "'" | "\"" => {
                        if let Some(Operand::Str(b)) = stack.pop() {
                            let cmap = fonts.get(&current_font).and_then(|c| c.as_ref());
                            push_str(&mut out, &mut pending_space, &b, cmap);
                        }
                    }
                    "Td" | "TD" | "T*" => {
                        if !out.is_empty() && !out.ends_with('\n') {
                            out.push('\n');
                        }
                        pending_space = false;
                    }
                    _ => {}
                }
                stack.clear();
            }
        }
    }
    out.trim().to_string()
}

pub fn run(args: &TextArgs) -> Result<()> {
    let doc = load(&args.file)?;
    let mut buf = String::new();
    for (num, pid) in doc.get_pages() {
        let text = run_page(&doc, pid);
        if !text.is_empty() {
            buf.push_str(&format!("--- Page {} ---\n", num));
            buf.push_str(&text);
            buf.push('\n');
        }
    }
    print!("{}", buf);
    Ok(())
}
