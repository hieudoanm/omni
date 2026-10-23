use anyhow::{anyhow, Result};
use serde_json::Value;
use std::io::Read;

/// Go `internal.ReadInput`: file arg or stdin.
pub fn read_input(args: &[String]) -> Result<Vec<u8>> {
    if let Some(f) = args.first() {
        return std::fs::read(f).map_err(|e| anyhow!("read file: {e}"));
    }
    let mut buf = Vec::new();
    std::io::stdin()
        .read_to_end(&mut buf)
        .map_err(|e| anyhow!("read stdin: {e}"))?;
    Ok(buf)
}

/// Go `internal.ReadCSVInput`: file arg or stdin, LazyQuotes.
pub fn read_csv_records(args: &[String]) -> Result<Vec<Vec<String>>> {
    let mut rdr = csv::ReaderBuilder::new()
        .has_headers(false)
        .flexible(true)
        .from_reader(input_reader(args)?);
    let mut out = Vec::new();
    for rec in rdr.records() {
        let rec = rec.map_err(|e| anyhow!("read csv: {e}"))?;
        out.push(rec.iter().map(|s| s.to_string()).collect());
    }
    Ok(out)
}

fn input_reader(args: &[String]) -> Result<Box<dyn std::io::Read>> {
    if let Some(f) = args.first() {
        let file = std::fs::File::open(f).map_err(|e| anyhow!("open file: {e}"))?;
        return Ok(Box::new(file));
    }
    Ok(Box::new(std::io::stdin()))
}

pub fn format_csv_text(records: &[Vec<String>]) -> String {
    records
        .iter()
        .map(|r| r.join(" | "))
        .collect::<Vec<_>>()
        .join("\n")
}

pub fn format_csv_json(records: &[Vec<String>]) -> String {
    serde_json::to_string_pretty(records).unwrap_or_default()
}

pub fn write_csv(path: &str, records: &[Vec<String>]) -> Result<()> {
    let mut wtr = csv::Writer::from_path(path).map_err(|e| anyhow!("create file: {e}"))?;
    for rec in records {
        wtr.write_record(rec)
            .map_err(|e| anyhow!("write csv: {e}"))?;
    }
    wtr.flush().map_err(|e| anyhow!("write csv: {e}"))?;
    Ok(())
}

// ---- YAML ----

pub fn parse_yml(input: &[u8]) -> Result<Value> {
    serde_yml::from_slice(input).map_err(|e| anyhow!("parse yaml: {e}"))
}

pub fn validate_yml(input: &[u8]) -> Result<()> {
    serde_yml::from_slice::<Value>(input)
        .map(|_| ())
        .map_err(|e| anyhow!("{e}"))
}

pub fn format_yml(data: &Value) -> Result<String> {
    serde_yml::to_string(data).map_err(|e| anyhow!("format yaml: {e}"))
}

pub fn yml_to_json(data: &Value) -> String {
    serde_json::to_string_pretty(data).unwrap_or_default()
}

// ---- JSON ----

pub fn parse_json(input: &[u8]) -> Result<Value> {
    serde_json::from_slice(input).map_err(|e| anyhow!("parse json: {e}"))
}

pub fn output_json(data: &Value) -> String {
    serde_json::to_string_pretty(data).unwrap_or_default()
}

/// Go `internal.JSONDiff`: line-diff of pretty-printed JSON.
pub fn json_diff(file1: &str, file2: &str) -> Result<()> {
    let a = std::fs::read(file1).map_err(|e| anyhow!("read {file1}: {e}"))?;
    let b = std::fs::read(file2).map_err(|e| anyhow!("read {file2}: {e}"))?;
    let va: Value = serde_json::from_slice(&a).unwrap_or(Value::Null);
    let vb: Value = serde_json::from_slice(&b).unwrap_or(Value::Null);
    let sa = serde_json::to_string_pretty(&va).unwrap_or_default();
    let sb = serde_json::to_string_pretty(&vb).unwrap_or_default();
    let la: Vec<&str> = sa.lines().collect();
    let lb: Vec<&str> = sb.lines().collect();
    let max = la.len().max(lb.len());
    for i in 0..max {
        let x = la.get(i).copied().unwrap_or("");
        let y = lb.get(i).copied().unwrap_or("");
        if x != y {
            if !x.is_empty() {
                println!("- {x}");
            }
            if !y.is_empty() {
                println!("+ {y}");
            }
        }
    }
    Ok(())
}

/// Go `internal.JSONMerge`: shallow top-level merge of two JSON objects.
pub fn json_merge(base_file: &str, patch_file: &str) -> Result<()> {
    let base = std::fs::read(base_file).map_err(|e| anyhow!("read base: {e}"))?;
    let patch = std::fs::read(patch_file).map_err(|e| anyhow!("read patch: {e}"))?;
    let mut base_map: serde_json::Map<String, Value> =
        serde_json::from_slice(&base).map_err(|e| anyhow!("parse base: {e}"))?;
    let patch_map: serde_json::Map<String, Value> =
        serde_json::from_slice(&patch).map_err(|e| anyhow!("parse patch: {e}"))?;
    for (k, v) in patch_map {
        base_map.insert(k, v);
    }
    println!(
        "{}",
        serde_json::to_string_pretty(&Value::Object(base_map))?
    );
    Ok(())
}

/// Go `internal.JSONQuery`: ".name.items[0]" style path lookup.
pub fn json_query<'a>(data: &'a Value, query: &str) -> Result<&'a Value> {
    let mut current = data;
    for part in query.split('.') {
        if part.is_empty() {
            continue;
        }
        if part.ends_with(']') {
            if let Some(idx_open) = part.find('[') {
                let key = &part[..idx_open];
                let arr_idx: usize = part[idx_open + 1..part.len() - 1]
                    .parse()
                    .map_err(|_| anyhow!("invalid index in query"))?;
                if !key.is_empty() {
                    current = current
                        .get(key)
                        .ok_or_else(|| anyhow!("expected object at {key}"))?;
                }
                let arr = current
                    .as_array()
                    .ok_or_else(|| anyhow!("expected array at index {arr_idx}"))?;
                current = arr
                    .get(arr_idx)
                    .ok_or_else(|| anyhow!("index {arr_idx} out of bounds"))?;
                continue;
            }
        }
        current = current
            .get(part)
            .ok_or_else(|| anyhow!("key {part} not found"))?;
    }
    Ok(current)
}
