use crate::requests;
use anyhow::{anyhow, Result};
use clap::{Args as ClapArgs, Subcommand};
use serde_json::json;
use std::io::Read;

#[derive(ClapArgs)]
#[command(
    about = "AI-powered text tools using OpenRouter",
    long_about = "Summarize, fix grammar, rewrite, and translate text using AI via OpenRouter."
)]
pub struct WriteArgs {
    #[command(subcommand)]
    pub command: Option<WriteCommand>,
}

#[derive(Subcommand)]
pub enum WriteCommand {
    /// Summarize text using AI
    Summarize(SummarizeArgs),
    /// Fix grammar in text using AI
    Grammar(GrammarArgs),
    /// Rewrite or paraphrase text using AI
    Rewrite(RewriteArgs),
    /// Translate text using AI
    Translate(TranslateArgs),
}

#[derive(clap::Args)]
pub struct SummarizeArgs {
    /// Text to summarize (reads file/stdin if omitted)
    #[arg()]
    pub text: Option<String>,
    /// Read input from file
    #[arg(long, default_value = "")]
    pub file: String,
    /// Maximum summary length in words
    #[arg(long, default_value_t = 100)]
    pub max_length: i64,
}

#[derive(clap::Args)]
pub struct GrammarArgs {
    /// Text to fix (reads file/stdin if omitted)
    #[arg()]
    pub text: Option<String>,
    /// Read input from file
    #[arg(long, default_value = "")]
    pub file: String,
}

#[derive(clap::Args)]
pub struct RewriteArgs {
    /// Text to rewrite (reads file/stdin if omitted)
    #[arg()]
    pub text: Option<String>,
    /// Read input from file
    #[arg(long, default_value = "")]
    pub file: String,
    /// Writing style (professional, casual, formal, concise)
    #[arg(long, default_value = "professional")]
    pub style: String,
}

#[derive(clap::Args)]
pub struct TranslateArgs {
    /// Text to translate (reads file/stdin if omitted)
    #[arg()]
    pub text: Option<String>,
    /// Read input from file
    #[arg(long, default_value = "")]
    pub file: String,
    /// Target language
    #[arg(long, default_value = "")]
    pub target: String,
}

fn call_llm(system_prompt: &str, user_text: &str) -> Result<String> {
    let api_key = std::env::var("OPENROUTER_API_KEY")
        .map_err(|_| anyhow!("OPENROUTER_API_KEY environment variable not set"))?;
    let body = json!({
        "model": "openai/gpt-4o-mini",
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_text},
        ],
    });
    let resp = requests::post_json(
        "https://openrouter.ai/api/v1/chat/completions",
        &api_key,
        &body,
    )
    .map_err(|e| anyhow!("API call failed: {e}"))?;
    let result: serde_json::Value =
        serde_json::from_slice(&resp).map_err(|e| anyhow!("failed to parse response: {e}"))?;
    if let Some(err) = result
        .get("error")
        .and_then(|e| e.get("message"))
        .and_then(|m| m.as_str())
    {
        if !err.is_empty() {
            return Err(anyhow!("API error: {err}"));
        }
    }
    let content = result
        .get("choices")
        .and_then(|c| c.as_array())
        .and_then(|c| c.first())
        .and_then(|c| c.get("message"))
        .and_then(|m| m.get("content"))
        .and_then(|c| c.as_str())
        .ok_or_else(|| anyhow!("no response from API"))?;
    Ok(content.trim().to_string())
}

fn read_input(text: Option<&str>, file: &str) -> Result<String> {
    if !file.is_empty() {
        return std::fs::read_to_string(file).map_err(|e| anyhow!("read file: {e}"));
    }
    if let Some(t) = text {
        return Ok(t.to_string());
    }
    let mut buf = String::new();
    std::io::stdin()
        .read_to_string(&mut buf)
        .map_err(|e| anyhow!("read stdin: {e}"))?;
    Ok(buf.trim().to_string())
}

fn run_llm(text: Option<&str>, file: &str, system_prompt: String) -> Result<()> {
    let input = read_input(text, file)?;
    let output = call_llm(&system_prompt, &input)?;
    println!("{output}");
    Ok(())
}

pub fn run(args: &WriteArgs) -> Result<()> {
    let Some(command) = &args.command else {
        let mut cmd = <WriteArgs as ClapArgs>::augment_args(clap::Command::new("write"));
        let _ = cmd.print_help();
        return Ok(());
    };
    match command {
        WriteCommand::Summarize(a) => run_llm(
            a.text.as_deref(),
            &a.file,
            format!(
                "Summarize the following text in at most {} words. Be concise and capture the main points.",
                a.max_length
            ),
        ),
        WriteCommand::Grammar(a) => run_llm(
            a.text.as_deref(),
            &a.file,
            "Fix the grammar, spelling, and punctuation of the following text. Return only the corrected text without explanations.".to_string(),
        ),
        WriteCommand::Rewrite(a) => run_llm(
            a.text.as_deref(),
            &a.file,
            format!(
                "Rewrite the following text in a {} tone. Return only the rewritten text without explanations.",
                a.style
            ),
        ),
        WriteCommand::Translate(a) => run_llm(
            a.text.as_deref(),
            &a.file,
            format!(
                "Translate the following text to {}. Return only the translation without explanations.",
                a.target
            ),
        ),
    }
}
