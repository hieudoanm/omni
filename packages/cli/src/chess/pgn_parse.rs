//! Minimal PGN movetext parser: extracts SAN tokens and optional [FEN] header.
//! Handles tag pairs, comments, variations, NAGs and move numbers.

pub struct ParsedPgn {
    pub sans: Vec<String>,
    pub fen: Option<String>,
}

/// Strip comments, variations and NAGs; return movetext tokens.
fn movetext_tokens(input: &str) -> Vec<String> {
    let b = input.as_bytes();
    let mut out = String::new();
    let mut i = 0;
    let mut depth = 0i32;
    while i < b.len() {
        match b[i] {
            b'{' => {
                while i < b.len() && b[i] != b'}' {
                    i += 1;
                }
                i += 1;
            }
            b'(' => {
                depth += 1;
                i += 1;
            }
            b')' => {
                depth -= 1;
                i += 1;
            }
            b'$' if depth == 0 => {
                while i < b.len() && (b[i].is_ascii_digit() || b[i] == b'!') {
                    i += 1;
                }
            }
            b'[' => {
                // skip a [Tag "value"] pair entirely
                i += 1;
                while i < b.len() {
                    if b[i] == b'"' {
                        i += 1;
                        while i < b.len() && b[i] != b'"' {
                            if b[i] == b'\\' {
                                i += 1;
                            }
                            i += 1;
                        }
                    } else if b[i] == b']' {
                        i += 1;
                        break;
                    }
                    i += 1;
                }
            }
            c if depth == 0 && !c.is_ascii_whitespace() => {
                // collect token until whitespace or special char
                let start = i;
                while i < b.len()
                    && !b[i].is_ascii_whitespace()
                    && !matches!(b[i], b'{' | b'(' | b')' | b'$' | b'[')
                {
                    i += 1;
                }
                out.push_str(&input[start..i]);
                out.push(' ');
            }
            _ => i += 1,
        }
    }
    out.split_whitespace().map(|s| s.to_string()).collect()
}

/// Extract [FEN "..."] tag value if present.
fn fen_tag(input: &str) -> Option<String> {
    let b = input.as_bytes();
    let mut i = 0;
    while i + 4 < b.len() {
        if &b[i..i + 4] == b"[FEN" {
            // find opening quote
            while i < b.len() && b[i] != b'"' {
                i += 1;
            }
            if i >= b.len() {
                return None;
            }
            i += 1;
            let start = i;
            while i < b.len() && b[i] != b'"' {
                if b[i] == b'\\' {
                    i += 1;
                }
                i += 1;
            }
            return Some(input[start..i].replace("\\\"", "\""));
        }
        i += 1;
    }
    None
}

pub fn parse_pgn(input: &str) -> ParsedPgn {
    let tokens = movetext_tokens(input);
    let sans: Vec<String> = tokens
        .into_iter()
        .filter(|t| {
            // drop move numbers like "1." "1..." "23." and game results
            let t = t.trim_end_matches('.');
            !t.is_empty()
                && !t.chars().all(|c| c.is_ascii_digit())
                && !matches!(t, "1-0" | "0-1" | "1/2-1/2" | "*")
        })
        .collect();
    ParsedPgn {
        sans,
        fen: fen_tag(input),
    }
}
