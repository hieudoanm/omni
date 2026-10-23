use crate::chess::lichess::cloud_eval;
use anyhow::{anyhow, Result};
use clap::Args;
use serde_json::json;

#[derive(Args)]
pub struct EvalArgs {
    /// FEN position string
    #[arg(long)]
    pub fen: String,
    /// Number of principal variations
    #[arg(long, default_value_t = 1)]
    pub multipv: i64,
    /// Output in JSON format
    #[arg(long, short = 'j', global = true)]
    pub json: bool,
}

pub fn run(args: &EvalArgs) -> Result<()> {
    if args.fen.is_empty() {
        return Err(anyhow!("--fen is required"));
    }
    let mut multi_pv = args.multipv;
    if multi_pv <= 0 {
        multi_pv = 1;
    }
    let eval = cloud_eval::cloud_eval_api(&args.fen, multi_pv, "standard")
        .map_err(|e| anyhow!("failed to fetch evaluation: {e}"))?;
    if args.json {
        let pvs: Vec<_> = eval
            .pvs
            .iter()
            .map(|pv| json!({"moves": pv.moves, "cp": pv.cp.unwrap_or(0)}))
            .collect();
        println!(
            "{}",
            serde_json::to_string_pretty(&json!({
                "fen": eval.fen,
                "depth": eval.depth,
                "nodes": eval.k_nodes,
                "pvs": pvs,
            }))?
        );
        return Ok(());
    }
    println!("\n♞ lichess.org Cloud Evaluation");
    println!("------------------------------------------------");
    println!("Depth : {}", eval.depth);
    println!("Nodes : {}", crate::chess::internal::comma(eval.k_nodes));
    println!();
    for (i, pv) in eval.pvs.iter().enumerate() {
        println!(
            "#{}  {:+.2}  {}",
            i + 1,
            pv.cp.unwrap_or(0) as f64 / 100.0,
            pv.moves
        );
    }
    Ok(())
}
