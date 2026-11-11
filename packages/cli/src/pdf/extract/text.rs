use crate::pdf::internal::*;
use anyhow::Result;
use clap::Args;

#[derive(Args)]
pub struct TextArgs {
    /// PDF file
    pub file: String,
}

fn unescape_pdf(s: &[u8]) -> String {
    let mut out = String::new();
    let mut i = 0;
    while i < s.len() {
        match s[i] {
            b'\\' if i + 1 < s.len() => {
                i += 1;
                match s[i] {
                    b'n' => out.push('\n'),
                    b'r' => out.push('\r'),
                    b't' => out.push('\t'),
                    b'b' => out.push('\u{8}'),
                    b'f' => out.push('\u{c}'),
                    b'(' | b')' | b'\\' => out.push(s[i] as char),
                    b'0'..=b'7' => {
                        let mut val = (s[i] - b'0') as u32;
                        let mut n = 1;
                        while n < 3 && i + 1 < s.len() && (b'0'..=b'7').contains(&s[i + 1]) {
                            i += 1;
                            val = val * 8 + (s[i] - b'0') as u32;
                            n += 1;
                        }
                        out.push(char::from_u32(val).unwrap_or('?'));
                    }
                    c => out.push(c as char),
                }
                i += 1;
            }
            c if c < 128 => {
                out.push(c as char);
                i += 1;
            }
            _ => {
                out.push('?');
                i += 1;
            }
        }
    }
    out
}

fn extract_strings(content: &[u8]) -> Vec<String> {
    let mut out = Vec::new();
    let mut i = 0;
    while i < content.len() {
        if content[i] == b'(' {
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
                out.push(unescape_pdf(&content[start..j - 1]));
            }
            i = j;
        } else {
            i += 1;
        }
    }
    out
}

pub fn run(args: &TextArgs) -> Result<()> {
    let doc = load(&args.file)?;
    let mut buf = String::new();
    for (num, pid) in doc.get_pages() {
        let content = doc.get_page_content(pid);
        let strings = extract_strings(&content);
        // filter out non-text noise: keep strings that look like words
        let text: Vec<&str> = strings
            .iter()
            .map(|s| s.trim())
            .filter(|s| !s.is_empty() && s.chars().any(|c| c.is_alphanumeric()))
            .collect();
        if !text.is_empty() {
            buf.push_str(&format!("--- Page {} ---\n", num));
            buf.push_str(&text.join(" "));
            buf.push('\n');
        }
    }
    print!("{}", buf);
    Ok(())
}
