//! PGN -> per-move FEN + cloud eval table.
use super::super::pgn_parse;
use crate::chess::lichess::cloud_eval;
use anyhow::{anyhow, Result};
use clap::Args;
use serde_json::json;
use shakmaty::{fen::Fen, san::San, CastlingMode, Position};

#[derive(Args)]
pub struct FenArgs {
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

fn classify_move(cp: i64) -> &'static str {
    match cp {
        ..=20 => "Best",
        21..=50 => "Good",
        51..=100 => "Inaccuracy",
        101..=200 => "Mistake",
        _ => "Blunder",
    }
}

pub fn run(args: &FenArgs) -> Result<()> {
    if args.pgn_file.is_empty() && args.pgn.is_empty() {
        return Err(anyhow!("❌ you must provide either --pgn-file or --pgn"));
    }
    if !args.pgn_file.is_empty() && !args.pgn.is_empty() {
        return Err(anyhow!("❌ please provide only one of --pgn-file or --pgn"));
    }
    let pgn = if !args.pgn_file.is_empty() {
        std::fs::read_to_string(&args.pgn_file)
            .map_err(|e| anyhow!("❌ failed to read PGN file: {e}"))?
    } else {
        args.pgn.trim().to_string()
    };
    let pgn = pgn.replace(". ", ".");
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

    let mut prev_eval: i64 = 0;
    let mut rows: Vec<serde_json::Value> = Vec::new();

    for (i, san_str) in parsed.sans.iter().enumerate() {
        let san = San::from_ascii(san_str.as_bytes())
            .map_err(|_| anyhow!("❌ failed to parse SAN: {san_str}"))?;
        let m = san
            .to_move(&pos)
            .map_err(|_| anyhow!("❌ illegal SAN move: {san_str}"))?;
        let mut san_text = String::new();
        shakmaty::san::San::from_move(&pos, m).append_to_string(&mut san_text);
        pos = pos
            .play(m)
            .map_err(|e| anyhow!("❌ illegal move: {san_str} ({e})"))?;
        let setup = pos.to_setup(shakmaty::EnPassantMode::Legal);
        let fen_str = Fen::try_from(setup)
            .map(|f| f.to_string())
            .unwrap_or_default();
        let eval = cloud_eval::cloud_eval_cp(&fen_str, "standard").unwrap_or(0);
        std::thread::sleep(std::time::Duration::from_millis(300));
        let cp_loss = (eval - prev_eval).abs();
        prev_eval = eval;
        let side = if i % 2 == 0 { "White" } else { "Black" };
        let move_number = i / 2 + 1;
        rows.push(json!({
            "move_number": move_number,
            "side": side,
            "san": san_text,
            "fen": fen_str,
            "eval": eval,
            "cp_loss": cp_loss,
            "label": classify_move(cp_loss),
        }));
    }

    if args.json {
        println!("{}", serde_json::to_string_pretty(&json!({"moves": rows}))?);
        return Ok(());
    }
    println!(
        "| {:<4} | {:<5} | {:<6} | {:<72} | {:<7} | {:<7} | {:<10} |",
        "Move", "Side", "SAN", "FEN", "Eval", "Loss", "Label"
    );
    println!(
        "| {} | {} | {} | {} | {} | {} | {} |",
        "-".repeat(4),
        "-".repeat(5),
        "-".repeat(6),
        "-".repeat(72),
        "-".repeat(7),
        "-".repeat(7),
        "-".repeat(10)
    );
    for r in &rows {
        println!(
            "| {:<4} | {:<5} | {:<6} | {:<72} | {:<7} | {:<7} | {:<10} |",
            r["move_number"], r["side"], r["san"], r["fen"], r["eval"], r["cp_loss"], r["label"]
        );
    }
    Ok(())
}
