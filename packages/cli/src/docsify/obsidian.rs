use super::internal;
use anyhow::Result;
use clap::Args;
use regex::Regex;
use serde::Serialize;
use std::collections::{BTreeMap, HashMap, HashSet};
use std::io::Write;
use std::path::{Path, PathBuf};
use std::sync::LazyLock;

#[derive(Args)]
pub struct ObsidianArgs {
    /// Root directory to scan
    #[arg(long, default_value = ".")]
    pub dir: String,
    /// Output file path (default: stdout)
    #[arg(long, default_value = "")]
    pub out: String,
    /// Output format: dot, json, edges
    #[arg(long, default_value = "dot")]
    pub format: String,
    /// Comma-separated directories to exclude
    #[arg(
        long,
        default_value = ".git,node_modules,vendor,dist,.next,__pycache__"
    )]
    pub exclude: String,
}

#[derive(Clone, Serialize)]
struct Node {
    id: String,
    label: String,
    path: String,
    #[serde(skip_serializing_if = "is_zero")]
    group: usize,
    #[serde(skip_serializing_if = "is_zero")]
    size: usize,
}

fn is_zero(v: &usize) -> bool {
    *v == 0
}

#[derive(Clone, Serialize)]
struct Edge {
    source: String,
    target: String,
}

#[derive(Serialize)]
struct Graph {
    nodes: Vec<Node>,
    links: Vec<Edge>,
}

static WIKI_LINK: LazyLock<Regex> =
    LazyLock::new(|| Regex::new(r"\[\[([^\]|]+)(?:\|[^\]|]+)?\]\]").unwrap());

pub fn run(args: &ObsidianArgs) -> Result<()> {
    let abs_dir = std::fs::canonicalize(&args.dir)?;
    let exclude = internal::parse_exclude_list(&args.exclude);
    let (mut nodes, edges) = build_graph(&abs_dir, &exclude)?;
    match args.format.as_str() {
        "json" => {
            let mut link_counts: HashMap<String, usize> = HashMap::new();
            for e in &edges {
                *link_counts.entry(e.source.clone()).or_default() += 1;
            }
            for n in &mut nodes {
                n.size = *link_counts.get(&n.id).unwrap_or(&0);
            }
            write_json(&nodes, &edges, &args.out)
        }
        "dot" => write_dot(&nodes, &edges, &args.out),
        _ => write_edges(&edges, &args.out),
    }
}

fn build_graph(
    root: &Path,
    exclude: &std::collections::HashSet<String>,
) -> Result<(Vec<Node>, Vec<Edge>)> {
    let mut markdown_files: BTreeMap<PathBuf, String> = BTreeMap::new();
    let mut links: HashMap<PathBuf, Vec<String>> = HashMap::new();

    walk_md(root, exclude, &mut |path| {
        let name = path.file_name().unwrap().to_string_lossy().to_string();
        markdown_files.insert(path.to_path_buf(), name.trim_end_matches(".md").to_string());
        if let Ok(content) = std::fs::read_to_string(path) {
            let mut file_links = Vec::new();
            for line in content.lines() {
                for m in WIKI_LINK.captures_iter(line) {
                    file_links.push(m[1].to_string());
                }
            }
            if !file_links.is_empty() {
                links.insert(path.to_path_buf(), file_links);
            }
        }
    });

    let mut lookup: HashMap<String, PathBuf> = HashMap::new();
    for (abs, display) in &markdown_files {
        lookup.insert(display.to_lowercase(), abs.clone());
    }

    let mut node_map: HashMap<PathBuf, usize> = HashMap::new();
    let mut nodes = Vec::new();
    for (p, display) in &markdown_files {
        let rel = internal::pathdiff(root, p);
        let group = if rel.contains('/') {
            rel.matches('/').count()
        } else {
            0
        };
        node_map.insert(p.clone(), nodes.len());
        nodes.push(Node {
            id: rel.clone(),
            label: display.clone(),
            path: rel,
            group,
            size: 0,
        });
    }

    let mut edge_set: HashSet<(usize, usize)> = HashSet::new();
    let mut edges = Vec::new();
    for (source_path, targets) in &links {
        let Some(&src_idx) = node_map.get(source_path) else {
            continue;
        };
        for t in targets {
            let Some(target_path) = lookup.get(&t.to_lowercase()) else {
                continue;
            };
            let Some(&tgt_idx) = node_map.get(target_path) else {
                continue;
            };
            if !edge_set.insert((src_idx, tgt_idx)) {
                continue;
            }
            edges.push(Edge {
                source: internal::pathdiff(root, source_path),
                target: internal::pathdiff(root, target_path),
            });
        }
    }

    Ok((nodes, edges))
}

fn walk_md<F: FnMut(&Path)>(dir: &Path, exclude: &std::collections::HashSet<String>, f: &mut F) {
    let Ok(entries) = std::fs::read_dir(dir) else {
        return;
    };
    for entry in entries.flatten() {
        let path = entry.path();
        let name = entry.file_name().to_string_lossy().to_string();
        if path.is_dir() {
            if name.starts_with('.') || exclude.contains(&name) {
                continue;
            }
            walk_md(&path, exclude, f);
        } else if name.to_lowercase().ends_with(".md") {
            f(&path);
        }
    }
}

fn write_output(data: &[u8], path: &str) -> Result<()> {
    if path.is_empty() {
        std::io::stdout().write_all(data)?;
    } else {
        std::fs::write(path, data)?;
    }
    Ok(())
}

fn write_json(nodes: &[Node], edges: &[Edge], path: &str) -> Result<()> {
    let g = Graph {
        nodes: nodes.to_vec(),
        links: edges.to_vec(),
    };
    let data = serde_json::to_string_pretty(&g)?;
    write_output(data.as_bytes(), path)
}

fn write_dot(nodes: &[Node], edges: &[Edge], path: &str) -> Result<()> {
    let mut b =
        String::from("digraph obsidian {\n  rankdir=LR;\n  node [shape=box style=rounded];\n\n");
    for n in nodes {
        let label = n.label.replace('"', "\\\"");
        b.push_str(&format!("  \"{}\" [label=\"{}\"];\n", n.id, label));
    }
    b.push('\n');
    for e in edges {
        b.push_str(&format!("  \"{}\" -> \"{}\";\n", e.source, e.target));
    }
    b.push_str("}\n");
    write_output(b.as_bytes(), path)
}

fn write_edges(edges: &[Edge], path: &str) -> Result<()> {
    let mut b = String::new();
    for e in edges {
        b.push_str(&format!("{} -> {}\n", e.source, e.target));
    }
    write_output(b.as_bytes(), path)
}
