//! Elo math (ported from cli.go chess/elo/internal/math.go).
use anyhow::{anyhow, Result};

pub fn expected_score(player: f64, opponent: f64) -> f64 {
    1.0 / (1.0 + 10f64.powf((opponent - player) / 400.0))
}

pub fn rating_change(player: f64, opponent: f64, score: f64, k: f64) -> (f64, f64) {
    let exp = expected_score(player, opponent);
    let delta = k * (score - exp);
    (delta, player + delta)
}

pub struct GameResult {
    pub opponent: f64,
    pub result: String,
    pub score: f64,
    pub expected: f64,
    pub rating_change: f64,
}

pub fn tournament_games(
    start: f64,
    k: f64,
    opponents: &[f64],
    results: &[String],
) -> (Vec<GameResult>, f64) {
    let mut games = Vec::new();
    let mut total_delta = 0.0;
    for (i, &opp) in opponents.iter().enumerate() {
        let score = result_to_score(&results[i]).unwrap_or(0.0);
        let exp = expected_score(start, opp);
        let delta = k * (score - exp);
        total_delta += delta;
        games.push(GameResult {
            opponent: opp,
            result: results[i].clone(),
            score,
            expected: exp,
            rating_change: delta,
        });
    }
    (games, total_delta)
}

pub fn performance_rating(ratings: &[f64], score: f64, games: usize) -> (f64, f64) {
    let sum: f64 = ratings.iter().sum();
    let avg = sum / ratings.len() as f64;
    let mut games = games;
    if games > ratings.len() {
        games = ratings.len();
    }
    let denom = games as f64 - score;
    let tpr = if score == 0.0 {
        avg - 800.0
    } else if score == games as f64 {
        avg + 800.0
    } else {
        avg + 400.0 * (score / denom).log10()
    };
    (avg, tpr)
}

pub fn required_score(avg: f64, games: f64, target: f64) -> (f64, f64) {
    let diff = target - avg;
    let ratio = 10f64.powf(diff / 400.0);
    let mut score = (ratio * games) / (1.0 + ratio);
    if score < 0.0 {
        score = 0.0;
    } else if score > games {
        score = games;
    }
    let pct = (score / games) * 100.0;
    (score, pct)
}

pub fn diff_to_expected(diff: f64) -> f64 {
    1.0 / (1.0 + 10f64.powf(-diff / 400.0))
}

pub fn expected_to_diff(exp: f64) -> f64 {
    -400.0 * ((1.0 / exp) - 1.0).log10()
}

pub fn parse_floats(s: &str) -> Vec<f64> {
    let mut vals = Vec::new();
    for p in s.split(',') {
        let p = p.trim();
        if p.is_empty() {
            continue;
        }
        match p.parse::<f64>() {
            Ok(v) => vals.push(v),
            Err(_) => return Vec::new(),
        }
    }
    vals
}

pub fn result_to_score(r: &str) -> Result<f64> {
    match r.trim() {
        "win" | "1" => Ok(1.0),
        "draw" | "0.5" => Ok(0.5),
        "loss" | "0" => Ok(0.0),
        _ => Err(anyhow!("invalid result; use win/draw/loss")),
    }
}
