use super::config;
use super::lib::{self, ProbeResult, ProbeStatus};
use anyhow::{anyhow, Result};
use clap::Args;
use serde::Serialize;
use std::sync::{Arc, Mutex};

#[derive(Args)]
pub struct StatusArgs {
    /// Filter models by name or ID before probing
    #[arg(long, short = 's', default_value = "")]
    pub search: String,
    /// Parallel probe workers
    #[arg(long, short = 'w', default_value_t = 6)]
    pub workers: usize,
}

#[derive(Serialize)]
struct StatusOutput {
    results: Vec<ProbeResult>,
    counts: Counts,
}

#[derive(Serialize, Default)]
struct Counts {
    ok: usize,
    rate_limited: usize,
    restricted: usize,
    error: usize,
}

pub fn run(args: &StatusArgs, json: bool) -> Result<()> {
    let api_key = config::load_api_key();
    if api_key.is_empty() {
        return Err(anyhow!(
            "no OpenRouter API key found.\n  Set OPEN_ROUTER_API_KEY or add it to ~/.omni"
        ));
    }
    eprintln!("\x1b[36mFetching free models from OpenRouter...\x1b[0m");
    let mut models = lib::fetch_free_models()?;
    if !args.search.is_empty() {
        let q = args.search.to_lowercase();
        models.retain(|m| m.id.to_lowercase().contains(&q) || m.name.to_lowercase().contains(&q));
    }
    if models.is_empty() {
        if json {
            println!(
                "{}",
                serde_json::to_string_pretty(&StatusOutput {
                    results: vec![],
                    counts: Counts::default(),
                })?
            );
        } else {
            println!("\x1b[33mNo models found.\x1b[0m");
        }
        return Ok(());
    }
    eprintln!(
        "\x1b[36mProbing {} model(s) with {} workers...\x1b[0m",
        models.len(),
        args.workers
    );
    let results = Arc::new(Mutex::new(Vec::with_capacity(models.len())));
    let next = Arc::new(Mutex::new(models.into_iter()));
    let workers = args.workers.max(1);
    let mut handles = Vec::new();
    for _ in 0..workers {
        let results = Arc::clone(&results);
        let next = Arc::clone(&next);
        let api_key = api_key.clone();
        handles.push(std::thread::spawn(move || loop {
            let m = {
                let mut it = next.lock().unwrap();
                it.next()
            };
            let Some(m) = m else { break };
            let r = lib::probe_model(&m, &api_key);
            results.lock().unwrap().push(r);
        }));
    }
    for h in handles {
        let _ = h.join();
    }
    let mut results = Arc::try_unwrap(results).unwrap().into_inner().unwrap();
    results.sort_by(|a, b| {
        status_rank(a)
            .cmp(&status_rank(b))
            .then(a.model.id.cmp(&b.model.id))
    });
    let mut counts = Counts::default();
    for r in &results {
        match r.status {
            ProbeStatus::Ok => counts.ok += 1,
            ProbeStatus::RateLimited => counts.rate_limited += 1,
            ProbeStatus::Restricted => counts.restricted += 1,
            ProbeStatus::Error => counts.error += 1,
        }
    }
    if json {
        println!(
            "{}",
            serde_json::to_string_pretty(&StatusOutput { results, counts })?
        );
        return Ok(());
    }
    println!("\n\x1b[1m\x1b[32mProbe Results\x1b[0m\n");
    for r in &results {
        let (glyph, color) = match r.status {
            ProbeStatus::Ok => ("●", "32"),
            ProbeStatus::RateLimited => ("◐", "33"),
            ProbeStatus::Restricted => ("○", "35"),
            ProbeStatus::Error => ("✕", "31"),
        };
        let msg = if r.message.is_empty() {
            String::new()
        } else {
            format!(" — {}", r.message)
        };
        let latency = if r.status == ProbeStatus::Ok {
            format!(" ({}ms)", r.latency_ms)
        } else {
            String::new()
        };
        println!(
            "  \x1b[{color}m{glyph}\x1b[0m {:<40} {:<15}{latency}{msg}",
            r.model.id,
            r.status.as_str()
        );
    }
    println!(
        "\n  ok={} rate_limited={} restricted={} error={}",
        counts.ok, counts.rate_limited, counts.restricted, counts.error
    );
    Ok(())
}

fn status_rank(r: &ProbeResult) -> u8 {
    match r.status {
        ProbeStatus::Ok => 0,
        ProbeStatus::RateLimited => 1,
        ProbeStatus::Restricted => 2,
        ProbeStatus::Error => 3,
    }
}
