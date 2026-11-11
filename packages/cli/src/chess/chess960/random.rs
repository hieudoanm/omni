//! Random Chess960 position picker.
use super::positions::POSITIONS;
use crate::chess::lichess::cloud_eval;
use anyhow::Result;
use clap::Args;
use rand::seq::IndexedRandom;
use serde_json::json;

#[derive(Args)]
pub struct RandomArgs {
    /// Output in JSON format
    #[arg(long, short = 'j', global = true)]
    pub json: bool,
}

pub fn run(_args: &RandomArgs) -> Result<()> {
    let json_output = _args.json;
    let mut rng = rand::rng();
    let idx = POSITIONS.choose(&mut rng).copied().unwrap_or("");
    let position_index = POSITIONS.iter().position(|p| *p == idx).unwrap_or(0);
    let fen = format!(
        "{}/pppppppp/8/8/8/8/PPPPPPPP/{} w KQkq - 0 1",
        idx.to_lowercase(),
        idx
    );
    let eval = cloud_eval::cloud_eval_cp(&fen, "chess960")
        .map_err(|e| anyhow::anyhow!("failed to evaluate position: {e}"))?;
    if json_output {
        println!(
            "{}",
            serde_json::to_string_pretty(&json!({
                "index": position_index + 1,
                "position": idx,
                "fen": fen,
                "evaluation": eval,
            }))?
        );
    } else {
        println!("Position {}: {idx}", position_index + 1);
        println!("FEN: {fen}");
        println!("Evaluation (centipawns): {eval}");
    }
    Ok(())
}
