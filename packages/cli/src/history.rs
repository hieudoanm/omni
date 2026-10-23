use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fmt;
use std::fs::{self, OpenOptions};
use std::io::Write;
use std::path::PathBuf;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Entry {
    pub timestamp: String,
    pub source: String,
    pub command: String,
    #[serde(default, skip_serializing_if = "String::is_empty")]
    pub cwd: String,
    #[serde(default, skip_serializing_if = "is_zero")]
    pub duration_ms: i64,
    #[serde(default, skip_serializing_if = "String::is_empty")]
    pub error: String,
}

fn is_zero(v: &i64) -> bool {
    *v == 0
}

impl fmt::Display for Entry {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}  {}", self.timestamp, self.command)?;
        if !self.error.is_empty() {
            write!(f, "  [{}]", self.error)?;
        }
        Ok(())
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CommandCount {
    pub name: String,
    pub count: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Stats {
    #[serde(rename = "total_cli")]
    pub total_cli: i64,
    #[serde(rename = "total_mcp")]
    pub total_mcp: i64,
    #[serde(rename = "top_commands")]
    pub top_commands: Vec<CommandCount>,
    #[serde(rename = "top_errors")]
    pub top_errors: Vec<CommandCount>,
}

fn storage_path() -> anyhow::Result<PathBuf> {
    let home =
        dirs::home_dir().ok_or_else(|| anyhow::anyhow!("cannot determine home directory"))?;
    let dir = home.join(".omni");
    fs::create_dir_all(&dir)?;
    Ok(dir.join("history.jsonl"))
}

pub fn append(entry: Entry) -> anyhow::Result<()> {
    let path = storage_path()?;
    let mut line = serde_json::to_string(&entry)?;
    line.push('\n');
    let mut f = OpenOptions::new().create(true).append(true).open(path)?;
    f.write_all(line.as_bytes())?;
    Ok(())
}

fn read_all() -> anyhow::Result<Vec<Entry>> {
    let path = storage_path()?;
    let data = match fs::read_to_string(&path) {
        Ok(d) => d,
        Err(e) if e.kind() == std::io::ErrorKind::NotFound => return Ok(Vec::new()),
        Err(e) => return Err(e.into()),
    };
    let mut entries = Vec::new();
    for line in data.lines() {
        let line = line.trim();
        if line.is_empty() {
            continue;
        }
        if let Ok(entry) = serde_json::from_str::<Entry>(line) {
            entries.push(entry);
        }
    }
    Ok(entries)
}

pub fn list(count: i64) -> anyhow::Result<Vec<Entry>> {
    let entries = read_all()?;
    let count = if count <= 0 || count as usize > entries.len() {
        entries.len()
    } else {
        count as usize
    };
    Ok(entries[entries.len() - count..].to_vec())
}

pub fn search(query: &str, limit: i64) -> anyhow::Result<Vec<Entry>> {
    let entries = read_all()?;
    let q = query.to_lowercase();
    let mut results = Vec::new();
    for e in entries.iter().rev() {
        if e.command.to_lowercase().contains(&q) {
            results.push(e.clone());
            if limit > 0 && results.len() as i64 >= limit {
                break;
            }
        }
    }
    Ok(results)
}

pub fn clear() -> anyhow::Result<()> {
    let path = storage_path()?;
    match fs::remove_file(&path) {
        Ok(()) => Ok(()),
        Err(e) if e.kind() == std::io::ErrorKind::NotFound => Ok(()),
        Err(e) => Err(e.into()),
    }
}

fn top_n(counts: HashMap<String, i64>, n: usize) -> Vec<CommandCount> {
    let mut result: Vec<CommandCount> = counts
        .into_iter()
        .map(|(name, count)| CommandCount { name, count })
        .collect();
    result.sort_by_key(|c| std::cmp::Reverse(c.count));
    result.truncate(n);
    result
}

pub fn compute_stats() -> anyhow::Result<Stats> {
    let entries = read_all()?;
    let mut total_cli = 0i64;
    let mut total_mcp = 0i64;
    let mut cmd_count: HashMap<String, i64> = HashMap::new();
    let mut err_count: HashMap<String, i64> = HashMap::new();
    for e in &entries {
        if e.source == "cli" {
            total_cli += 1;
        } else {
            total_mcp += 1;
        }
        *cmd_count.entry(e.command.clone()).or_default() += 1;
        if !e.error.is_empty() {
            *err_count.entry(e.command.clone()).or_default() += 1;
        }
    }
    Ok(Stats {
        total_cli,
        total_mcp,
        top_commands: top_n(cmd_count, 10),
        top_errors: top_n(err_count, 10),
    })
}
