//! Lichess cloud evaluation API (mirrors lichess.org/cloud_eval.go).
use super::client;
use anyhow::{anyhow, Result};
use serde::Deserialize;

#[derive(Debug, Clone, Deserialize)]
pub struct CloudEvalPv {
    pub moves: String,
    #[serde(default)]
    pub cp: Option<i64>,
    #[serde(default)]
    pub mate: Option<i64>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct CloudEvalResponse {
    #[serde(default)]
    pub fen: String,
    #[serde(default)]
    pub depth: i64,
    #[serde(rename = "knodes", default)]
    pub k_nodes: i64,
    #[serde(default)]
    pub pvs: Vec<CloudEvalPv>,
}

pub fn cloud_eval_api(fen: &str, multi_pv: i64, variant: &str) -> Result<CloudEvalResponse> {
    let params = [
        ("fen", fen.to_string()),
        ("multiPv", multi_pv.to_string()),
        ("variant", variant.to_string()),
    ];
    let body = client::do_get("/cloud-eval", &params)?;
    serde_json::from_slice(&body).map_err(|e| anyhow!("{e}"))
}

pub fn cloud_eval_cp(fen: &str, variant: &str) -> Result<i64> {
    let data = cloud_eval_api(fen, 1, variant)?;
    let Some(pv) = data.pvs.first() else {
        return Ok(0);
    };
    if let Some(mate) = pv.mate {
        return Ok(if mate > 0 { 10000 } else { -10000 });
    }
    Ok(pv.cp.unwrap_or(0))
}
