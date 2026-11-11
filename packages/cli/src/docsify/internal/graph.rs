use super::extractor::FileInfo;
use super::walker::File;
use std::collections::HashMap;

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum NodeKind {
    File,
    Function,
    Method,
    Type,
    Interface,
    Class,
    Variable,
    Constant,
}

impl NodeKind {
    pub fn as_str(&self) -> &'static str {
        match self {
            NodeKind::File => "file",
            NodeKind::Function => "function",
            NodeKind::Method => "method",
            NodeKind::Type => "type",
            NodeKind::Interface => "interface",
            NodeKind::Class => "class",
            NodeKind::Variable => "variable",
            NodeKind::Constant => "constant",
        }
    }
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum EdgeKind {
    Contains,
    Calls,
}

impl EdgeKind {
    pub fn as_str(&self) -> &'static str {
        match self {
            EdgeKind::Contains => "contains",
            EdgeKind::Calls => "calls",
        }
    }
}

#[derive(Clone, Debug)]
pub struct Node {
    pub id: String,
    pub kind: NodeKind,
    pub label: String,
    pub file: String,
    pub line: usize,
    pub lang: String,
    pub exported: bool,
}

#[derive(Clone, Debug)]
pub struct Edge {
    pub id: String,
    pub source: String,
    pub target: String,
    pub kind: EdgeKind,
    pub line: usize,
}

pub struct Graph {
    pub nodes: Vec<Node>,
    pub edges: Vec<Edge>,
    node_by_id: HashMap<String, usize>,
    symbol_index: HashMap<String, Vec<String>>,
    edge_counter: usize,
}

impl Graph {
    pub fn new() -> Self {
        Graph {
            nodes: Vec::new(),
            edges: Vec::new(),
            node_by_id: HashMap::new(),
            symbol_index: HashMap::new(),
            edge_counter: 0,
        }
    }

    pub fn add_file(&mut self, info: &FileInfo) {
        let file_id = sanitize_id(&format!("file:{}", info.file.rel_path));
        self.add_node(Node {
            id: file_id.clone(),
            kind: NodeKind::File,
            label: info.file.rel_path.clone(),
            file: info.file.rel_path.clone(),
            line: 0,
            lang: info.file.lang.as_str().to_string(),
            exported: false,
        });

        for sym in &info.symbols {
            let sym_id = sanitize_id(&format!(
                "sym:{}:{}:{}",
                info.file.rel_path, sym.name, sym.line
            ));
            self.add_node(Node {
                id: sym_id.clone(),
                kind: symbol_kind(sym.kind),
                label: sym.name.clone(),
                file: info.file.rel_path.clone(),
                line: sym.line,
                lang: info.file.lang.as_str().to_string(),
                exported: sym.exported,
            });
            self.symbol_index
                .entry(sym.name.clone())
                .or_default()
                .push(sym_id.clone());
            let edge_id = self.next_edge_id();
            self.edges.push(Edge {
                id: edge_id,
                source: file_id.clone(),
                target: sym_id,
                kind: EdgeKind::Contains,
                line: sym.line,
            });
        }

        for call in &info.calls {
            let caller_id = self.find_symbol_in_file(&call.caller_name, &info.file.rel_path);
            if caller_id.is_empty() {
                continue;
            }
            let edge_id = self.next_edge_id();
            self.edges.push(Edge {
                id: edge_id,
                source: caller_id,
                target: format!("UNRESOLVED:{}", call.callee_name),
                kind: EdgeKind::Calls,
                line: call.line,
            });
        }
    }

    pub fn resolve_call_edges(&mut self) {
        let mut resolved: Vec<Edge> = Vec::new();
        let edges = std::mem::take(&mut self.edges);
        for e in edges {
            if !e.target.starts_with("UNRESOLVED:") {
                resolved.push(e);
                continue;
            }
            let callee = &e.target["UNRESOLVED:".len()..];
            let Some(targets) = self.symbol_index.get(callee).cloned() else {
                continue;
            };
            for (i, t) in targets.iter().enumerate() {
                resolved.push(Edge {
                    id: if i == 0 {
                        e.id.clone()
                    } else {
                        self.next_edge_id()
                    },
                    source: e.source.clone(),
                    target: t.clone(),
                    kind: EdgeKind::Calls,
                    line: e.line,
                });
            }
        }
        self.edges = resolved;
    }

    pub fn node_count(&self) -> usize {
        self.nodes.len()
    }

    pub fn edge_count(&self) -> usize {
        self.edges.len()
    }

    fn add_node(&mut self, n: Node) {
        if !self.node_by_id.contains_key(&n.id) {
            self.node_by_id.insert(n.id.clone(), self.nodes.len());
            self.nodes.push(n);
        }
    }

    fn next_edge_id(&mut self) -> String {
        self.edge_counter += 1;
        format!("e{}", self.edge_counter)
    }

    fn find_symbol_in_file(&self, name: &str, rel_path: &str) -> String {
        if let Some(candidates) = self.symbol_index.get(name) {
            for id in candidates {
                if let Some(&idx) = self.node_by_id.get(id) {
                    if self.nodes[idx].file == rel_path {
                        return id.clone();
                    }
                }
            }
        }
        String::new()
    }
}

fn symbol_kind(k: super::extractor::SymbolKind) -> NodeKind {
    match k {
        super::extractor::SymbolKind::Function => NodeKind::Function,
        super::extractor::SymbolKind::Method => NodeKind::Method,
        super::extractor::SymbolKind::Type => NodeKind::Type,
        super::extractor::SymbolKind::Interface => NodeKind::Interface,
        super::extractor::SymbolKind::Class => NodeKind::Class,
        super::extractor::SymbolKind::Variable => NodeKind::Variable,
        super::extractor::SymbolKind::Constant => NodeKind::Constant,
    }
}

fn sanitize_id(s: &str) -> String {
    s.replace(['/', '\\', '.', ' ', ':', '-'], "_")
}

#[allow(dead_code)]
fn _file_marker(_: &File) {}
