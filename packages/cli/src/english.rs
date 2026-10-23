use crate::requests;
use anyhow::{anyhow, Result};
use clap::{Args as ClapArgs, Subcommand};
use serde::{Deserialize, Serialize};

#[derive(ClapArgs)]
#[command(
    about = "English dictionary tools",
    long_about = "English dictionary lookup tool that fetches word definitions, synonyms, antonyms, and usage examples."
)]
pub struct EnglishArgs {
    #[command(subcommand)]
    pub command: Option<EnglishCommand>,
    /// Output in JSON format
    #[arg(long, short = 'j', global = true)]
    pub json: bool,
}

#[derive(Subcommand)]
pub enum EnglishCommand {
    /// Look up the definition of an English word
    Define(DefineArgs),
}

#[derive(clap::Args)]
pub struct DefineArgs {
    /// Word to define
    #[arg(long, short = 'w', default_value = "")]
    pub word: String,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct ResultEntry {
    #[serde(default)]
    pub definition: String,
    #[serde(rename = "partOfSpeech", default)]
    pub part_of_speech: String,
    #[serde(default)]
    pub synonyms: Vec<String>,
    #[serde(default)]
    pub anonyms: Vec<String>,
    #[serde(rename = "usageOf", default)]
    pub usage_of: Vec<String>,
    #[serde(rename = "typeOf", default)]
    pub type_of: Vec<String>,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct Word {
    #[serde(default)]
    pub word: String,
    #[serde(default)]
    pub results: Vec<ResultEntry>,
}

fn lookup_word(word: &str) -> Result<Word> {
    let url = format!(
        "https://raw.githubusercontent.com/hieudoanm/words/refs/heads/master/packages/data/english/words/{word}.json"
    );
    let body = requests::get(&url).map_err(|e| anyhow!("fetch error: {e}"))?;
    serde_json::from_slice(&body).map_err(|e| anyhow!("json error: {e}"))
}

fn format_definition(data: &Word, json_output: bool) -> String {
    if json_output {
        return serde_json::to_string_pretty(data).unwrap_or_else(|e| e.to_string());
    }
    let mut out = format!("\nWORD: {}\n\n", data.word);
    for (i, r) in data.results.iter().enumerate() {
        out.push_str(&format!("{}) {}\n", i + 1, r.part_of_speech));
        out.push_str(&format!("   Definition: {}\n", r.definition));
        if !r.synonyms.is_empty() {
            out.push_str(&format!("   Synonyms: {}\n", r.synonyms.join(", ")));
        }
        if !r.anonyms.is_empty() {
            out.push_str(&format!("   Antonyms: {}\n", r.anonyms.join(", ")));
        }
        out.push('\n');
    }
    out
}

pub fn run(args: &EnglishArgs) -> Result<()> {
    let Some(command) = &args.command else {
        let mut cmd = <EnglishArgs as ClapArgs>::augment_args(clap::Command::new("english"));
        let _ = cmd.print_help();
        return Ok(());
    };
    match command {
        EnglishCommand::Define(a) => {
            let word = a.word.trim().to_lowercase();
            if word.is_empty() {
                return Err(anyhow!("word cannot be empty"));
            }
            let data = lookup_word(&word)?;
            println!("{}", format_definition(&data, args.json));
            Ok(())
        }
    }
}
