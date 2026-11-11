use anyhow::Result;
use clap::{Args as ClapArgs, Subcommand};

mod base64;
mod braille;
mod camelcase;
mod capitalise;
mod count;
mod deburr;
mod internal;
mod kebabcase;
mod lorem;
mod lowercase;
mod morse;
mod pascalcase;
mod slug;
mod snakecase;
mod uppercase;
mod url;

#[derive(ClapArgs)]
#[command(
    about = "Text conversion utilities",
    long_about = "Convert text between formats: Braille, Morse code, and string case transformations.",
    after_long_help = "Examples:\n  omni convert base64 \"hello world\"\n  omni convert morse \"sos\"\n  omni convert slug \"Hello World!\""
)]
pub struct ConvertArgs {
    #[command(subcommand)]
    pub command: Option<ConvertCommand>,
    /// Output in JSON format
    #[arg(long, short = 'j', global = true)]
    pub json: bool,
}

#[derive(Subcommand)]
pub enum ConvertCommand {
    /// Convert text to braille
    Braille(braille::Args),
    /// Convert text to morse code
    Morse(morse::Args),
    /// Base64 encode/decode
    Base64(base64::Base64Args),
    /// Encode or decode a URL
    Url(url::Args),
    /// Capitalise each word
    Capitalise(capitalise::Args),
    /// Remove diacritical marks
    Deburr(deburr::Args),
    /// Convert to kebab-case
    Kebabcase(kebabcase::Args),
    /// Generate Lorem Ipsum placeholder text
    Lorem(lorem::Args),
    /// Convert to camelCase
    Camelcase(camelcase::Args),
    /// Convert to PascalCase
    Pascalcase(pascalcase::Args),
    /// Convert text to URL-friendly slug
    Slug(slug::Args),
    /// Convert text to lowercase
    Lowercase(lowercase::Args),
    /// Convert to snake_case
    Snakecase(snakecase::Args),
    /// Convert text to uppercase
    Uppercase(uppercase::Args),
    /// Count characters, words, and lines in text
    Count(count::Args),
}

pub fn run(args: &ConvertArgs) -> Result<()> {
    let Some(command) = &args.command else {
        let mut cmd = <ConvertArgs as ClapArgs>::augment_args(clap::Command::new("convert"));
        let _ = cmd.print_help();
        return Ok(());
    };
    match command {
        ConvertCommand::Braille(a) => braille::run(a, args.json),
        ConvertCommand::Morse(a) => morse::run(a, args.json),
        ConvertCommand::Base64(a) => base64::run(a, args.json),
        ConvertCommand::Url(a) => url::run(a, args.json),
        ConvertCommand::Capitalise(a) => capitalise::run(a, args.json),
        ConvertCommand::Deburr(a) => deburr::run(a, args.json),
        ConvertCommand::Kebabcase(a) => kebabcase::run(a, args.json),
        ConvertCommand::Lorem(a) => lorem::run(a, args.json),
        ConvertCommand::Camelcase(a) => camelcase::run(a, args.json),
        ConvertCommand::Pascalcase(a) => pascalcase::run(a, args.json),
        ConvertCommand::Slug(a) => slug::run(a, args.json),
        ConvertCommand::Lowercase(a) => lowercase::run(a, args.json),
        ConvertCommand::Snakecase(a) => snakecase::run(a, args.json),
        ConvertCommand::Uppercase(a) => uppercase::run(a, args.json),
        ConvertCommand::Count(a) => count::run(a, args.json),
    }
}
