use anyhow::Result;
use serde::Serialize;
use std::io::{self, Read, Write};
use unicode_categories::UnicodeCategories;
use unicode_normalization::UnicodeNormalization;

pub fn write_json<T: Serialize>(value: &T) -> Result<()> {
    println!("{}", serde_json::to_string_pretty(value)?);
    Ok(())
}

pub fn resolve_text(text: Option<&str>) -> Result<String> {
    if let Some(t) = text {
        return Ok(t.to_string());
    }
    print!("Text: ");
    io::stdout().flush()?;
    let mut buf = String::new();
    io::stdin().read_line(&mut buf)?;
    Ok(buf.trim_end_matches(['\r', '\n']).to_string())
}

pub fn read_stdin() -> Result<String> {
    let mut buf = String::new();
    io::stdin().read_to_string(&mut buf)?;
    Ok(buf)
}

fn upper_first_lower_rest(word: &str) -> String {
    let mut chars = word.chars();
    match chars.next() {
        Some(first) => {
            let mut out = first.to_uppercase().collect::<String>();
            out.extend(chars.as_str().chars().flat_map(|c| c.to_lowercase()));
            out
        }
        None => String::new(),
    }
}

fn split_words(s: &str) -> Vec<&str> {
    s.split([' ', '-', '_']).filter(|w| !w.is_empty()).collect()
}

pub fn to_camel_case(s: &str) -> String {
    let words = split_words(s);
    let mut out = String::new();
    for (i, w) in words.iter().enumerate() {
        if i == 0 {
            out.extend(w.chars().flat_map(|c| c.to_lowercase()));
        } else {
            out.push_str(&upper_first_lower_rest(w));
        }
    }
    out
}

pub fn to_pascal_case(s: &str) -> String {
    split_words(s)
        .iter()
        .map(|w| upper_first_lower_rest(w))
        .collect()
}

fn insert_case_separator(s: &str, sep: char, space_sep: char, dash_sep: char) -> String {
    let chars: Vec<char> = s.chars().collect();
    let mut out = String::new();
    if chars.is_empty() {
        return out;
    }
    out.push(chars[0]);
    let mut i = 0;
    while i + 1 < chars.len() {
        let a = chars[i];
        let b = chars[i + 1];
        if (a.is_ascii_lowercase() || a.is_ascii_digit()) && b.is_ascii_uppercase() {
            out.push(sep);
        }
        out.push(b);
        i += 1;
    }
    out.chars()
        .map(|c| match c {
            ' ' => space_sep,
            '_' => dash_sep,
            '-' => dash_sep,
            other => other,
        })
        .collect::<String>()
        .to_lowercase()
}

pub fn to_kebab_case(s: &str) -> String {
    insert_case_separator(s, '-', '-', '-')
}

pub fn to_snake_case(s: &str) -> String {
    insert_case_separator(s, '_', '_', '_')
}

pub fn capitalise(s: &str) -> String {
    s.split_whitespace()
        .map(upper_first_lower_rest)
        .collect::<Vec<_>>()
        .join(" ")
}

pub fn deburr(s: &str) -> String {
    s.nfd().filter(|c| !c.is_mark()).collect()
}

pub fn slug(s: &str) -> String {
    let lowered = s.to_lowercase().replace(' ', "-");
    let filtered: String = lowered
        .chars()
        .filter(|c| c.is_ascii_alphanumeric() || *c == '-')
        .collect();
    let mut collapsed = String::with_capacity(filtered.len());
    let mut last_dash = false;
    for c in filtered.chars() {
        if c == '-' {
            if !last_dash {
                collapsed.push('-');
            }
            last_dash = true;
        } else {
            collapsed.push(c);
            last_dash = false;
        }
    }
    collapsed.trim_matches('-').to_string()
}

fn braille_map(ch: char) -> Option<&'static str> {
    Some(match ch {
        'a' => "⠁",
        'b' => "⠃",
        'c' => "⠉",
        'd' => "⠙",
        'e' => "⠑",
        'f' => "⠋",
        'g' => "⠛",
        'h' => "⠓",
        'i' => "⠊",
        'j' => "⠚",
        'k' => "⠅",
        'l' => "⠇",
        'm' => "⠍",
        'n' => "⠝",
        'o' => "⠕",
        'p' => "⠏",
        'q' => "⠟",
        'r' => "⠗",
        's' => "⠎",
        't' => "⠞",
        'u' => "⠥",
        'v' => "⠧",
        'w' => "⠺",
        'x' => "⠭",
        'y' => "⠽",
        'z' => "⠵",
        '.' => "⠲",
        ',' => "⠂",
        ';' => "⠆",
        ':' => "⠒",
        '!' => "⠖",
        '?' => "⠦",
        '\'' => "⠄",
        '-' => "⠤",
        '(' => "⠣",
        ')' => "⠜",
        '"' => "⠘",
        _ => return None,
    })
}

pub fn to_braille(text: &str) -> String {
    let mut out = String::new();
    for ch in text.chars().flat_map(|c| c.to_lowercase()) {
        match braille_map(ch) {
            Some(code) => out.push_str(code),
            None => out.push(ch),
        }
    }
    out
}

fn morse_map(ch: char) -> Option<&'static str> {
    Some(match ch {
        'a' => ".-",
        'b' => "-...",
        'c' => "-.-.",
        'd' => "-..",
        'e' => ".",
        'f' => "..-.",
        'g' => "--.",
        'h' => "....",
        'i' => "..",
        'j' => ".---",
        'k' => "-.-",
        'l' => ".-..",
        'm' => "--",
        'n' => "-.",
        'o' => "---",
        'p' => ".--.",
        'q' => "--.-",
        'r' => ".-.",
        's' => "...",
        't' => "-",
        'u' => "..-",
        'v' => "...-",
        'w' => ".--",
        'x' => "-..-",
        'y' => "-.--",
        'z' => "--..",
        '1' => ".----",
        '2' => "..---",
        '3' => "...--",
        '4' => "....-",
        '5' => ".....",
        '6' => "-....",
        '7' => "--...",
        '8' => "---..",
        '9' => "----.",
        '0' => "-----",
        '.' => ".-.-.-",
        ',' => "--..--",
        ';' => "-.-.-.",
        ':' => "---...",
        '!' => "-.-.--",
        '?' => "..--..",
        '\'' => ".----.",
        '-' => "-....-",
        '(' => "-.--.",
        ')' => "-.--.-",
        '"' => ".-..-.",
        '/' => "-..-.",
        _ => return None,
    })
}

pub fn to_morse(text: &str) -> String {
    text.chars()
        .flat_map(|c| c.to_lowercase())
        .map(|ch| {
            morse_map(ch)
                .map(str::to_string)
                .unwrap_or_else(|| ch.to_string())
        })
        .collect::<Vec<_>>()
        .join(" ")
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_to_braille() {
        assert_eq!(to_braille("hello"), "⠓⠑⠇⠇⠕");
        assert_eq!(to_braille("Hello"), "⠓⠑⠇⠇⠕");
    }

    #[test]
    fn test_to_morse() {
        assert_eq!(to_morse("sos"), "... --- ...");
        assert_eq!(to_morse("SOS"), "... --- ...");
    }

    #[test]
    fn test_capitalise() {
        assert_eq!(capitalise("hello world"), "Hello World");
        assert_eq!(capitalise(""), "");
    }

    #[test]
    fn test_deburr() {
        assert_eq!(deburr("héllo wörld"), "hello world");
        assert_eq!(deburr("café"), "cafe");
    }

    #[test]
    fn test_to_kebab_case() {
        assert_eq!(to_kebab_case("helloWorld"), "hello-world");
        assert_eq!(to_kebab_case("Hello World"), "hello-world");
    }

    #[test]
    fn test_to_snake_case() {
        assert_eq!(to_snake_case("helloWorld"), "hello_world");
        assert_eq!(to_snake_case("Hello World"), "hello_world");
    }

    #[test]
    fn test_to_camel_case() {
        assert_eq!(to_camel_case("hello world"), "helloWorld");
        assert_eq!(to_camel_case("Hello-World"), "helloWorld");
    }

    #[test]
    fn test_to_pascal_case() {
        assert_eq!(to_pascal_case("hello world"), "HelloWorld");
        assert_eq!(to_pascal_case("hello-world"), "HelloWorld");
    }

    #[test]
    fn test_slug() {
        assert_eq!(slug("Hello World!"), "hello-world");
        assert_eq!(slug("  --test--  "), "test");
    }

    #[test]
    fn test_upper_first_lower_rest() {
        assert_eq!(upper_first_lower_rest("hELLO"), "Hello");
        assert_eq!(upper_first_lower_rest(""), "");
    }
}
