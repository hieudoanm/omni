//! Chess960 setup helper (ported from cli.go chess/setup).
use crate::chess::chess960::positions::POSITIONS;
use crate::chess::lichess::cloud_eval;
use anyhow::{anyhow, Result};
use clap::Args;
use std::io::{self, Write};

#[derive(Args)]
pub struct SetupArgs {
    /// Output in JSON format
    #[arg(long, short = 'j', global = true)]
    pub json: bool,
}

pub fn run(_args: &SetupArgs) -> Result<()> {
    let mut input = String::new();
    print!("Position (default 518): ");
    let _ = io::stdout().flush();
    let _ = io::stdin().read_line(&mut input);
    let input = input.trim();

    let mut position_index = 518usize;
    if !input.is_empty() {
        position_index = input.parse().map_err(|_| anyhow!("❌ invalid number"))?;
    }
    if position_index < 1 || position_index > POSITIONS.len() {
        return Err(anyhow!(
            "❌ position must be between 1 and {}",
            POSITIONS.len()
        ));
    }
    let position = POSITIONS[position_index - 1];
    println!("Position {position_index}: {position}");
    let fen = format!(
        "{}/pppppppp/8/8/8/8/PPPPPPPP/{} w KQkq - 0 1",
        position.to_lowercase(),
        position
    );
    println!("FEN: {fen}");
    let eval = cloud_eval::cloud_eval_cp(&fen, "chess960")
        .map_err(|e| anyhow!("❌ failed to evaluate position: {e}"))?;
    println!("Evaluation (centipawns): {eval}");
    Ok(())
}
