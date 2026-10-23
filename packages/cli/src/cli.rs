use clap::{CommandFactory, FromArgMatches, Parser, Subcommand};

use crate::better;
use crate::calc;
use crate::casino;
use crate::chess;
use crate::colors;
use crate::completion;
use crate::convert;
use crate::crypto;
use crate::data;
use crate::docsify;
use crate::doi;
use crate::english;
use crate::file;
use crate::games;
use crate::gemini;
use crate::gh;
use crate::history_cmd;
use crate::image;
use crate::mcp;
use crate::net;
use crate::openapi;
use crate::openrouter;
use crate::pdf;
use crate::port;
use crate::search;
use crate::semver;
use crate::system;
use crate::telegram;
use crate::time;
use crate::version;
use crate::video;
use crate::web;
use crate::write;

#[derive(Parser)]
#[command(
    name = "omni",
    about = "Hieu Doan's personal CLI toolbox",
    long_about = "A collection of CLI utilities covering system monitoring, cloud service status, currency conversion, text processing, UUID generation, and more.",
    after_long_help = "Examples:\n  omni calc bmi --height 175 --weight 70\n  omni casino blackjack\n  omni convert base64 --input \"hello world\"\n  omni crypto uuid\n  omni data json --pretty --file data.json\n  omni file read main.go\n  omni net ip\n  omni system monitor\n  omni time now\n  omni version"
)]
pub struct Cli {
    #[command(subcommand)]
    pub command: Command,
}

#[derive(Subcommand)]
pub enum Command {
    /// Text conversion utilities
    Convert(convert::ConvertArgs),
    /// Command execution history
    History(history_cmd::HistoryArgs),
    /// English dictionary tools
    English(english::EnglishArgs),
    /// Network port checking tools
    Port(port::PortArgs),
    /// Parse, compare, sort, and bump semver strings
    Semver(semver::SemverArgs),
    /// Generate shell completion scripts
    Completion(completion::Args),
    /// Print the application version
    Version(version::Args),
    /// MCP server exposing CLI tools to AI agents
    Mcp(mcp::McpArgs),
    /// DOI productivity tools
    Doi(doi::DoiArgs),
    /// OpenAPI related tools
    Openapi(openapi::OpenapiArgs),
    /// AI-powered text tools using OpenRouter
    Write(write::WriteArgs),
    /// Financial and utility calculators
    Calc(calc::CalcArgs),
    /// Time and scheduling tools
    Time(time::TimeArgs),
    /// Better replacements for common Unix commands
    Better(better::BetterArgs),
    /// System monitoring and clipboard management
    System(system::SystemArgs),
    /// Format, convert, split, archive, and process data files
    Data(data::DataArgs),
    /// Codebase documentation and analysis tools
    Docsify(docsify::DocsifyArgs),
    /// Universal search for files, text, code, and the web
    Search(search::SearchArgs),
    /// File operations
    File(file::FileArgs),
    /// Network diagnostics and servers
    Net(net::NetArgs),
    /// Video processing with ffmpeg
    Video(video::VideoArgs),
    /// Color conversion and palette generation tools
    Colors(colors::ColorsArgs),
    /// GitHub CLI tools
    Gh(gh::GhArgs),
    /// Cryptographic and security tools
    Crypto(crypto::CryptoArgs),
    /// Casino games: blackjack, poker odds, and more
    Casino(casino::CasinoArgs),
    /// Image processing tools
    Image(image::ImageArgs),
    /// Web service tools
    Web(web::WebArgs),
    /// Interact with OpenRouter AI models and services
    Openrouter(openrouter::OpenrouterArgs),
    /// Play games in the terminal
    Games(games::GamesArgs),
    /// Chess tools: Elo, Chess960, FEN/PGN, Lichess and Chess.com
    Chess(chess::ChessArgs),
    /// PDF manipulation tools
    Pdf(pdf::PdfArgs),
    /// Telegram bot and message tools
    Telegram(telegram::TelegramArgs),
    /// Interact with Google Gemini AI models
    Gemini(gemini::GeminiArgs),
}

pub fn dispatch(matches: &clap::ArgMatches) -> anyhow::Result<()> {
    let cli = Cli::from_arg_matches(matches)?;
    match cli.command {
        Command::Convert(args) => convert::run(&args),
        Command::History(args) => history_cmd::run(&args),
        Command::English(args) => english::run(&args),
        Command::Port(args) => port::run(&args),
        Command::Semver(args) => semver::run(&args),
        Command::Completion(args) => completion::run(&args),
        Command::Version(args) => version::run(&args),
        Command::Mcp(args) => mcp::run(&args),
        Command::Doi(args) => doi::run(&args),
        Command::Openapi(args) => openapi::run(&args),
        Command::Write(args) => write::run(&args),
        Command::Calc(args) => calc::run(&args),
        Command::Time(args) => time::run(&args),
        Command::Better(args) => better::run(&args),
        Command::System(args) => system::run(&args),
        Command::Data(args) => data::run(&args),
        Command::Docsify(args) => docsify::run(&args),
        Command::Search(args) => search::run(&args),
        Command::File(args) => file::run(&args),
        Command::Net(args) => net::run(&args),
        Command::Video(args) => video::run(&args),
        Command::Colors(args) => colors::run(&args),
        Command::Gh(args) => gh::run(&args),
        Command::Crypto(args) => crypto::run(&args),
        Command::Casino(args) => casino::run(&args),
        Command::Image(args) => image::run(&args),
        Command::Web(args) => web::run(&args),
        Command::Openrouter(args) => openrouter::run(&args),
        Command::Games(args) => games::run(&args),
        Command::Chess(args) => chess::run(&args),
        Command::Pdf(args) => pdf::run(&args),
        Command::Telegram(args) => telegram::run(&args),
        Command::Gemini(args) => gemini::run(&args),
    }
}

pub fn command() -> clap::Command {
    Cli::command()
}
