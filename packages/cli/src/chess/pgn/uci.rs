//! PGN -> UCI converter.
use super::super::pgn_parse;
use anyhow::{anyhow, Result};
use clap::Args;
use serde_json::json;
use shakmaty::{fen::Fen, san::San, CastlingMode, Position};

#[derive(Args)]
pub struct UciArgs {
    /// Path to a PGN file
    #[arg(long = "pgn-file", default_value = "")]
    pub pgn_file: String,
    /// PGN string
    #[arg(long, default_value = "")]
    pub pgn: String,
    /// Output in JSON format
    #[arg(long, short = 'j', global = true)]
    pub json: bool,
}

fn read_pgn(args: &UciArgs) -> Result<String> {
    if args.pgn_file.is_empty() && args.pgn.is_empty() {
        return Err(anyhow!("❌ you must provide either --pgn-file or --pgn"));
    }
    if !args.pgn_file.is_empty() && !args.pgn.is_empty() {
        return Err(anyhow!("❌ please provide only one of --pgn-file or --pgn"));
    }
    if !args.pgn_file.is_empty() {
        return std::fs::read_to_string(&args.pgn_file)
            .map_err(|e| anyhow!("❌ failed to read PGN file: {e}"));
    }
    Ok(args.pgn.trim().to_string())
}

pub fn run(args: &UciArgs) -> Result<()> {
    let pgn = read_pgn(args)?;
    let parsed = pgn_parse::parse_pgn(&pgn);
    if parsed.sans.is_empty() {
        return Err(anyhow!("❌ no moves found in PGN"));
    }
    let mut pos: shakmaty::Chess = if let Some(fen) = &parsed.fen {
        Fen::from_ascii(fen.as_bytes())
            .map_err(|e| anyhow!("❌ failed to parse FEN: {e}"))?
            .into_position(CastlingMode::Standard)
            .map_err(|e| anyhow!("❌ failed to parse FEN: {e}"))?
    } else {
        Fen::from_ascii(b"rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1")
            .map_err(|e| anyhow!("❌ failed to parse FEN: {e}"))?
            .into_position(CastlingMode::Standard)
            .map_err(|e| anyhow!("❌ failed to parse FEN: {e}"))?
    };
    let mut uci_moves = Vec::new();
    for san_str in &parsed.sans {
        let san = San::from_ascii(san_str.as_bytes())
            .map_err(|_| anyhow!("❌ failed to parse SAN: {san_str}"))?;
        let m = san
            .to_move(&pos)
            .map_err(|_| anyhow!("❌ illegal SAN move: {san_str}"))?;
        let uci = shakmaty::uci::UciMove::from_move(m, CastlingMode::Standard);
        let mut s = String::new();
        uci.append_to_string(&mut s);
        uci_moves.push(s);
        pos = pos
            .play(m)
            .map_err(|e| anyhow!("❌ illegal move: {san_str} ({e})"))?;
    }
    if args.json {
        println!(
            "{}",
            serde_json::to_string_pretty(&json!({"moves": uci_moves}))?
        );
    } else {
        println!("{}", uci_moves.join(" "));
    }
    Ok(())
}
