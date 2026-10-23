use crate::convert::internal::write_json;
use anyhow::Result;
use rand::RngExt;
use serde::Serialize;

const LOREM_WORDS: &[&str] = &[
    "lorem",
    "ipsum",
    "dolor",
    "sit",
    "amet",
    "consectetur",
    "adipiscing",
    "elit",
    "sed",
    "do",
    "eiusmod",
    "tempor",
    "incididunt",
    "ut",
    "labore",
    "et",
    "dolore",
    "magna",
    "aliqua",
    "enim",
    "ad",
    "minim",
    "veniam",
    "quis",
    "nostrud",
    "exercitation",
    "ullamco",
    "laboris",
    "nisi",
    "aliquip",
    "ex",
    "ea",
    "commodo",
    "consequat",
    "duis",
    "aute",
    "irure",
    "in",
    "reprehenderit",
    "voluptate",
    "velit",
    "esse",
    "cillum",
    "eu",
    "fugiat",
    "nulla",
    "pariatur",
    "excepteur",
    "sint",
    "occaecat",
    "cupidatat",
    "non",
    "proident",
    "sunt",
    "culpa",
    "qui",
    "officia",
    "deserunt",
    "mollit",
    "anim",
    "id",
    "est",
    "laborum",
];

#[derive(clap::Args)]
pub struct Args {
    /// Number of paragraphs to generate
    #[arg(long, short = 'p', default_value_t = 3)]
    pub paragraphs: i64,
    /// Number of words to generate (overrides --paragraphs)
    #[arg(long, short = 'w', default_value_t = 0)]
    pub words: i64,
}

#[derive(Serialize)]
struct LoremResult {
    text: String,
}

fn random_word() -> &'static str {
    LOREM_WORDS[rand::rng().random_range(0..LOREM_WORDS.len())]
}

fn sentence() -> String {
    let n = rand::rng().random_range(5..13);
    let mut s = (0..n).map(|_| random_word()).collect::<Vec<_>>().join(" ");
    if let Some(first) = s.get_mut(0..1) {
        first.make_ascii_uppercase();
    }
    s.push('.');
    s
}

fn paragraph() -> String {
    let n = rand::rng().random_range(3..9);
    (0..n).map(|_| sentence()).collect::<Vec<_>>().join(" ")
}

fn word_string(n: usize) -> String {
    let mut s = (0..n).map(|_| random_word()).collect::<Vec<_>>().join(" ");
    if let Some(first) = s.get_mut(0..1) {
        first.make_ascii_uppercase();
    }
    s
}

pub fn run(args: &Args, json: bool) -> Result<()> {
    let text = if args.words > 0 {
        word_string(args.words as usize)
    } else {
        let paragraphs = args.paragraphs.max(0) as usize;
        (0..paragraphs)
            .map(|_| paragraph())
            .collect::<Vec<_>>()
            .join("\n\n")
    };
    if json {
        return write_json(&LoremResult { text });
    }
    println!("{text}");
    Ok(())
}
