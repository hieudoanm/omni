use std::collections::HashMap;

/// A parsed `/ToUnicode` CMap mapping character codes to Unicode strings.
pub struct CMap {
    map: HashMap<Vec<u8>, String>,
    lengths: Vec<usize>,
}

fn hex_bytes(tok: &str) -> Option<Vec<u8>> {
    let h = tok.trim();
    if h.len() < 2 || !h.starts_with('<') || !h.ends_with('>') {
        return None;
    }
    let h = &h[1..h.len() - 1];
    if !h.len().is_multiple_of(2) || !h.bytes().all(|b| b.is_ascii_hexdigit()) {
        return None;
    }
    (0..h.len())
        .step_by(2)
        .map(|i| u8::from_str_radix(&h[i..i + 2], 16).ok())
        .collect()
}

/// Split a CMap section body into `<...>` hex tokens.
fn hex_tokens(body: &str) -> Vec<Vec<u8>> {
    let b = body.as_bytes();
    let mut out = Vec::new();
    let mut i = 0;
    while i < b.len() {
        if b[i] == b'<' && i + 1 < b.len() && b[i + 1] != b'<' {
            let mut j = i + 1;
            while j < b.len() && b[j] != b'>' {
                j += 1;
            }
            if j < b.len() {
                if let Some(bytes) = hex_bytes(&body[i..=j]) {
                    out.push(bytes);
                }
            }
            i = j + 1;
        } else {
            i += 1;
        }
    }
    out
}

fn sections<'a>(text: &'a str, begin: &str, end: &str) -> Vec<&'a str> {
    let mut out = Vec::new();
    let mut pos = 0;
    while let Some(rel) = text[pos..].find(begin) {
        let start = pos + rel + begin.len();
        if let Some(stop_rel) = text[start..].find(end) {
            out.push(&text[start..start + stop_rel]);
            pos = start + stop_rel + end.len();
        } else {
            break;
        }
    }
    out
}

fn utf16_be(bytes: &[u8]) -> String {
    if bytes.is_empty() {
        return String::new();
    }
    let mut units = Vec::with_capacity(bytes.len() / 2);
    for pair in bytes.as_chunks::<2>().0 {
        units.push(u16::from_be_bytes(*pair));
    }
    String::from_utf16_lossy(&units)
}

/// Increment a big-endian byte string by one (used for `bfrange` destinations).
fn increment_be(bytes: &[u8], n: usize) -> Vec<u8> {
    let mut out = bytes.to_vec();
    let mut carry = n as u64;
    for i in (0..out.len()).rev() {
        let v = out[i] as u64 + carry;
        out[i] = (v & 0xff) as u8;
        carry = v >> 8;
        if carry == 0 {
            break;
        }
    }
    out
}

fn code_len(bytes: &[u8]) -> usize {
    bytes.len()
}

impl CMap {
    pub fn parse(data: &[u8]) -> Option<CMap> {
        let text = String::from_utf8_lossy(data);
        let mut map = HashMap::new();
        let mut lengths: Vec<usize> = Vec::new();

        for body in sections(&text, "begincodespacerange", "endcodespacerange") {
            let toks = hex_tokens(body);
            for pair in toks.as_chunks::<2>().0 {
                let len = code_len(&pair[1]);
                if len > 0 && !lengths.contains(&len) {
                    lengths.push(len);
                }
            }
        }

        for body in sections(&text, "beginbfchar", "endbfchar") {
            let toks = hex_tokens(body);
            for pair in toks.as_chunks::<2>().0 {
                map.insert(pair[0].clone(), utf16_be(&pair[1]));
            }
        }

        for body in sections(&text, "beginbfrange", "endbfrange") {
            let b = body.as_bytes();
            let mut i = 0;
            while i < b.len() {
                if b[i] == b'<' {
                    let mut j = i;
                    while j < b.len() && b[j] != b'>' {
                        j += 1;
                    }
                    if j >= b.len() {
                        break;
                    }
                    let lo = hex_bytes(&body[i..=j]);
                    i = j + 1;
                    // find next '<' for hi or '[' for array form
                    let mut k = i;
                    while k < b.len() && b[k] != b'<' && b[k] != b'[' {
                        k += 1;
                    }
                    if k >= b.len() || lo.is_none() {
                        break;
                    }
                    if b[k] == b'[' {
                        let mut m = k + 1;
                        let mut dsts = Vec::new();
                        while m < b.len() && b[m] != b']' {
                            if b[m] == b'<' {
                                let mut n = m;
                                while n < b.len() && b[n] != b'>' {
                                    n += 1;
                                }
                                if n < b.len() {
                                    if let Some(bytes) = hex_bytes(&body[m..=n]) {
                                        dsts.push(bytes);
                                    }
                                }
                                m = n + 1;
                            } else {
                                m += 1;
                            }
                        }
                        i = if m < b.len() { m + 1 } else { m };
                        if let Some(lo) = lo {
                            let base: u64 = lo.iter().fold(0u64, |a, &b| (a << 8) | b as u64);
                            for (idx, dst) in dsts.iter().enumerate() {
                                let n = base + idx as u64;
                                let mut key = Vec::with_capacity(lo.len());
                                for p in (0..lo.len()).rev() {
                                    key.push(((n >> (8 * p)) & 0xff) as u8);
                                }
                                map.insert(key, utf16_be(dst));
                            }
                        }
                    } else {
                        // lo hi dst form
                        let mut j2 = k;
                        while j2 < b.len() && b[j2] != b'>' {
                            j2 += 1;
                        }
                        if j2 >= b.len() {
                            break;
                        }
                        let hi = hex_bytes(&body[k..=j2]);
                        i = j2 + 1;
                        let mut k2 = i;
                        while k2 < b.len() && b[k2] != b'<' {
                            k2 += 1;
                        }
                        if k2 >= b.len() {
                            break;
                        }
                        let mut j3 = k2;
                        while j3 < b.len() && b[j3] != b'>' {
                            j3 += 1;
                        }
                        if j3 >= b.len() {
                            break;
                        }
                        let dst = hex_bytes(&body[k2..=j3]);
                        i = j3 + 1;
                        if let (Some(lo), Some(hi), Some(dst)) = (lo, hi, dst) {
                            if lo.len() == hi.len() && hi >= lo {
                                let start: u64 = lo.iter().fold(0u64, |a, &b| (a << 8) | b as u64);
                                let end: u64 = hi.iter().fold(0u64, |a, &b| (a << 8) | b as u64);
                                for n in start..=end {
                                    let mut key = Vec::with_capacity(lo.len());
                                    for p in (0..lo.len()).rev() {
                                        key.push(((n >> (8 * p)) & 0xff) as u8);
                                    }
                                    map.insert(
                                        key,
                                        utf16_be(&increment_be(&dst, (n - start) as usize)),
                                    );
                                }
                            }
                        }
                    }
                } else {
                    i += 1;
                }
            }
        }

        for key in map.keys() {
            let len = key.len();
            if len > 0 && !lengths.contains(&len) {
                lengths.push(len);
            }
        }
        lengths.sort_unstable_by(|a, b| b.cmp(a));

        if map.is_empty() {
            return None;
        }
        Some(CMap { map, lengths })
    }

    /// Decode a byte string of character codes into Unicode text.
    pub fn decode(&self, bytes: &[u8]) -> String {
        let mut out = String::new();
        let mut i = 0;
        while i < bytes.len() {
            let mut matched = false;
            for &len in &self.lengths {
                if i + len <= bytes.len() {
                    if let Some(s) = self.map.get(&bytes[i..i + len]) {
                        out.push_str(s);
                        i += len;
                        matched = true;
                        break;
                    }
                }
            }
            if !matched {
                i += 1;
            }
        }
        out
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    const CMAP: &[u8] = b"/CIDInit /ProcSet findresource begin
12 dict begin
begincmap
/CIDSystemInfo << /Registry (Adobe) /Ordering (UCS) /Supplement 0 >> def
1 begincodespacerange
<0000> <FFFF>
endcodespacerange
2 beginbfchar
<0001> <0048>
<0002> <0069>
endbfchar
1 beginbfrange
<0003> <0005> <0041>
endbfrange
1 beginbfrange
<0010> <0012> [<0061> <0062> <0063>]
endbfrange
endcmap
end
end
";

    #[test]
    fn decodes_bfchar_and_bfrange() {
        let cmap = CMap::parse(CMAP).unwrap();
        // 0001->H 0002->i, 0003->A 0004->B 0005->C, 0010->a 0011->b 0012->c
        assert_eq!(cmap.decode(&[0x00, 0x01, 0x00, 0x02]), "Hi");
        assert_eq!(cmap.decode(&[0x00, 0x03, 0x00, 0x04, 0x00, 0x05]), "ABC");
        assert_eq!(cmap.decode(&[0x00, 0x10, 0x00, 0x11, 0x00, 0x12]), "abc");
    }

    #[test]
    fn skips_undecodable_bytes() {
        let cmap = CMap::parse(CMAP).unwrap();
        assert_eq!(cmap.decode(&[0x00, 0x09, 0x00, 0x01]), "H");
    }

    #[test]
    fn returns_none_without_mappings() {
        assert!(CMap::parse(b"begincmap\nendcmap").is_none());
    }
}
