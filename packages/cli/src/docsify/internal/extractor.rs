use crate::docsify::internal::walker::{File, Language};
use regex::Regex;
use std::collections::HashSet;
use std::sync::LazyLock;

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum SymbolKind {
    Function,
    Method,
    Type,
    Interface,
    Class,
    Variable,
    Constant,
}

impl SymbolKind {
    pub fn as_str(&self) -> &'static str {
        match self {
            SymbolKind::Function => "function",
            SymbolKind::Method => "method",
            SymbolKind::Type => "type",
            SymbolKind::Interface => "interface",
            SymbolKind::Class => "class",
            SymbolKind::Variable => "variable",
            SymbolKind::Constant => "constant",
        }
    }
}

#[derive(Clone, Debug)]
pub struct Symbol {
    pub name: String,
    pub kind: SymbolKind,
    pub line: usize,
    pub receiver: String,
    pub exported: bool,
}

#[derive(Clone, Debug)]
pub struct CallEdge {
    pub caller_name: String,
    pub callee_name: String,
    pub line: usize,
}

#[derive(Clone, Debug)]
pub struct FileInfo {
    pub file: File,
    pub symbols: Vec<Symbol>,
    pub calls: Vec<CallEdge>,
}

pub fn extract(f: File) -> std::io::Result<FileInfo> {
    let src = std::fs::read_to_string(&f.abs_path)?;
    let mut info = FileInfo {
        file: f.clone(),
        symbols: Vec::new(),
        calls: Vec::new(),
    };
    match f.lang {
        Language::Go => extract_go(&src, &mut info),
        Language::TypeScript | Language::JavaScript => extract_ts(&src, &mut info),
        Language::Python => extract_python(&src, &mut info),
        Language::Rust => extract_rust(&src, &mut info),
        Language::Unknown => {}
    }
    Ok(info)
}

static GO_FUNC: LazyLock<Regex> =
    LazyLock::new(|| Regex::new(r"^func\s+(?:\((\w+)\s+\*?\w+\)\s+)?(\w+)\s*\(").unwrap());
static GO_TYPE: LazyLock<Regex> =
    LazyLock::new(|| Regex::new(r"^type\s+(\w+)\s+(struct|interface)\b").unwrap());
static GO_VAR: LazyLock<Regex> = LazyLock::new(|| Regex::new(r"^(?:var|const)\s+(\w+)\b").unwrap());
static GO_CALL: LazyLock<Regex> = LazyLock::new(|| Regex::new(r"\b([A-Za-z_]\w*)\s*\(").unwrap());

fn extract_go(src: &str, info: &mut FileInfo) {
    let mut current_func = String::new();
    for (i, line) in src.lines().enumerate() {
        let trimmed = line.trim();
        let line_no = i + 1;
        if let Some(m) = GO_FUNC.captures(trimmed) {
            let receiver = m.get(1).map(|g| g.as_str().to_string()).unwrap_or_default();
            let name = m.get(2).unwrap().as_str().to_string();
            let kind = if receiver.is_empty() {
                SymbolKind::Function
            } else {
                SymbolKind::Method
            };
            info.symbols.push(Symbol {
                name: name.clone(),
                kind,
                line: line_no,
                receiver,
                exported: is_exported(&name),
            });
            current_func = name;
            continue;
        }
        if let Some(m) = GO_TYPE.captures(trimmed) {
            let name = m[1].to_string();
            let kind = if &m[2] == "interface" {
                SymbolKind::Interface
            } else {
                SymbolKind::Type
            };
            info.symbols.push(Symbol {
                name: name.clone(),
                kind,
                line: line_no,
                receiver: String::new(),
                exported: is_exported(&name),
            });
            continue;
        }
        if let Some(m) = GO_VAR.captures(trimmed) {
            let name = m[1].to_string();
            info.symbols.push(Symbol {
                name: name.clone(),
                kind: SymbolKind::Variable,
                line: line_no,
                receiver: String::new(),
                exported: is_exported(&name),
            });
            continue;
        }
        if !current_func.is_empty() {
            for cm in GO_CALL.captures_iter(trimmed) {
                let callee = cm[1].to_string();
                if is_go_builtin(&callee) || callee == current_func {
                    continue;
                }
                info.calls.push(CallEdge {
                    caller_name: current_func.clone(),
                    callee_name: callee,
                    line: line_no,
                });
            }
        }
    }
}

static TS_FUNC: LazyLock<Regex> = LazyLock::new(|| {
    Regex::new(r"(?:^|\s)(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*[(<]").unwrap()
});
static TS_ARROW: LazyLock<Regex> = LazyLock::new(|| {
    Regex::new(r"(?:^|\s)(?:export\s+)?(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s*)?\(").unwrap()
});
static TS_CLASS: LazyLock<Regex> =
    LazyLock::new(|| Regex::new(r"(?:^|\s)(?:export\s+)?(?:abstract\s+)?class\s+(\w+)\b").unwrap());
static TS_IFACE: LazyLock<Regex> =
    LazyLock::new(|| Regex::new(r"(?:^|\s)(?:export\s+)?interface\s+(\w+)\b").unwrap());
static TS_TYPE: LazyLock<Regex> =
    LazyLock::new(|| Regex::new(r"(?:^|\s)(?:export\s+)?type\s+(\w+)\s*=").unwrap());
static TS_CONST: LazyLock<Regex> =
    LazyLock::new(|| Regex::new(r"(?:^|\s)(?:export\s+)?const\s+(\w+)\s*[=:]").unwrap());
static TS_CALL: LazyLock<Regex> = LazyLock::new(|| Regex::new(r"\b([A-Za-z_]\w*)\s*\(").unwrap());

fn extract_ts(src: &str, info: &mut FileInfo) {
    let mut current_func = String::new();
    for (i, line) in src.lines().enumerate() {
        let trimmed = line.trim();
        let line_no = i + 1;
        let exported = line.contains("export");
        let mut pushed = false;
        for (re, kind) in [
            (&*TS_FUNC, SymbolKind::Function),
            (&*TS_ARROW, SymbolKind::Function),
        ] {
            if let Some(m) = re.captures(trimmed) {
                let name = m[1].to_string();
                info.symbols.push(Symbol {
                    name: name.clone(),
                    kind,
                    line: line_no,
                    receiver: String::new(),
                    exported,
                });
                current_func = name;
                pushed = true;
                break;
            }
        }
        if pushed {
            continue;
        }
        for (re, kind) in [
            (&*TS_CLASS, SymbolKind::Class),
            (&*TS_IFACE, SymbolKind::Interface),
            (&*TS_TYPE, SymbolKind::Type),
            (&*TS_CONST, SymbolKind::Constant),
        ] {
            if let Some(m) = re.captures(trimmed) {
                let name = m[1].to_string();
                info.symbols.push(Symbol {
                    name,
                    kind,
                    line: line_no,
                    receiver: String::new(),
                    exported,
                });
                break;
            }
        }
        if !current_func.is_empty() {
            for cm in TS_CALL.captures_iter(trimmed) {
                let callee = cm[1].to_string();
                if is_ts_builtin(&callee) || callee == current_func {
                    continue;
                }
                info.calls.push(CallEdge {
                    caller_name: current_func.clone(),
                    callee_name: callee,
                    line: line_no,
                });
            }
        }
    }
}

static PY_FUNC: LazyLock<Regex> =
    LazyLock::new(|| Regex::new(r"^(?:async\s+)?def\s+(\w+)\s*\(").unwrap());
static PY_CLASS: LazyLock<Regex> = LazyLock::new(|| Regex::new(r"^class\s+(\w+)\b").unwrap());
static PY_CONST: LazyLock<Regex> =
    LazyLock::new(|| Regex::new(r"^([A-Z_][A-Z0-9_]*)\s*=").unwrap());
static PY_CALL: LazyLock<Regex> = LazyLock::new(|| Regex::new(r"\b([A-Za-z_]\w*)\s*\(").unwrap());

fn extract_python(src: &str, info: &mut FileInfo) {
    let mut current_func = String::new();
    for (i, line) in src.lines().enumerate() {
        let trimmed = line.trim();
        let line_no = i + 1;
        if let Some(m) = PY_FUNC.captures(trimmed) {
            let name = m[1].to_string();
            let exported = !name.starts_with('_');
            info.symbols.push(Symbol {
                name: name.clone(),
                kind: SymbolKind::Function,
                line: line_no,
                receiver: String::new(),
                exported,
            });
            current_func = name;
            continue;
        }
        if let Some(m) = PY_CLASS.captures(trimmed) {
            let name = m[1].to_string();
            let exported = !name.starts_with('_');
            info.symbols.push(Symbol {
                name,
                kind: SymbolKind::Class,
                line: line_no,
                receiver: String::new(),
                exported,
            });
            continue;
        }
        if let Some(m) = PY_CONST.captures(trimmed) {
            let name = m[1].to_string();
            info.symbols.push(Symbol {
                name,
                kind: SymbolKind::Constant,
                line: line_no,
                receiver: String::new(),
                exported: true,
            });
            continue;
        }
        if !current_func.is_empty() {
            for cm in PY_CALL.captures_iter(trimmed) {
                let callee = cm[1].to_string();
                if is_py_builtin(&callee) || callee == current_func {
                    continue;
                }
                info.calls.push(CallEdge {
                    caller_name: current_func.clone(),
                    callee_name: callee,
                    line: line_no,
                });
            }
        }
    }
}

static RS_FUNC: LazyLock<Regex> =
    LazyLock::new(|| Regex::new(r"(?:^|\s)(?:pub\s+)?(?:async\s+)?fn\s+(\w+)\s*[(<]").unwrap());
static RS_STRUCT: LazyLock<Regex> =
    LazyLock::new(|| Regex::new(r"(?:^|\s)(?:pub\s+)?struct\s+(\w+)\b").unwrap());
static RS_TRAIT: LazyLock<Regex> =
    LazyLock::new(|| Regex::new(r"(?:^|\s)(?:pub\s+)?trait\s+(\w+)\b").unwrap());
static RS_ENUM: LazyLock<Regex> =
    LazyLock::new(|| Regex::new(r"(?:^|\s)(?:pub\s+)?enum\s+(\w+)\b").unwrap());
static RS_CONST: LazyLock<Regex> =
    LazyLock::new(|| Regex::new(r"(?:^|\s)(?:pub\s+)?const\s+(\w+)\s*:").unwrap());
static RS_CALL: LazyLock<Regex> = LazyLock::new(|| Regex::new(r"\b([A-Za-z_]\w*)\s*\(").unwrap());

fn extract_rust(src: &str, info: &mut FileInfo) {
    let mut current_func = String::new();
    for (i, line) in src.lines().enumerate() {
        let trimmed = line.trim();
        let line_no = i + 1;
        let exported = line.contains("pub ");
        if let Some(m) = RS_FUNC.captures(trimmed) {
            let name = m[1].to_string();
            info.symbols.push(Symbol {
                name: name.clone(),
                kind: SymbolKind::Function,
                line: line_no,
                receiver: String::new(),
                exported,
            });
            current_func = name;
            continue;
        }
        for (re, kind) in [
            (&*RS_STRUCT, SymbolKind::Type),
            (&*RS_TRAIT, SymbolKind::Interface),
            (&*RS_ENUM, SymbolKind::Type),
            (&*RS_CONST, SymbolKind::Constant),
        ] {
            if let Some(m) = re.captures(trimmed) {
                let name = m[1].to_string();
                info.symbols.push(Symbol {
                    name,
                    kind,
                    line: line_no,
                    receiver: String::new(),
                    exported,
                });
                break;
            }
        }
        if !current_func.is_empty() {
            for cm in RS_CALL.captures_iter(trimmed) {
                let callee = cm[1].to_string();
                if is_rs_builtin(&callee) || callee == current_func {
                    continue;
                }
                info.calls.push(CallEdge {
                    caller_name: current_func.clone(),
                    callee_name: callee,
                    line: line_no,
                });
            }
        }
    }
}

fn is_exported(name: &str) -> bool {
    name.chars().next().is_some_and(|c| c.is_ascii_uppercase())
}

fn builtins_set(items: &[&'static str]) -> HashSet<&'static str> {
    items.iter().copied().collect()
}

static GO_BUILTINS: LazyLock<HashSet<&'static str>> = LazyLock::new(|| {
    builtins_set(&[
        "append", "cap", "close", "complex", "copy", "delete", "imag", "len", "make", "new",
        "panic", "print", "println", "real", "recover", "string", "int", "uint", "bool", "byte",
        "rune", "error", "float64", "float32", "int64", "int32", "uint64", "uint32", "fmt", "os",
        "err",
    ])
});
static TS_BUILTINS: LazyLock<HashSet<&'static str>> = LazyLock::new(|| {
    builtins_set(&[
        "console",
        "setTimeout",
        "setInterval",
        "clearTimeout",
        "parseInt",
        "parseFloat",
        "isNaN",
        "isFinite",
        "String",
        "Number",
        "Boolean",
        "Array",
        "Object",
        "Promise",
        "JSON",
        "Math",
        "Date",
        "Error",
        "require",
        "import",
        "export",
        "typeof",
        "instanceof",
        "if",
        "for",
        "while",
        "switch",
        "return",
    ])
});
static PY_BUILTINS: LazyLock<HashSet<&'static str>> = LazyLock::new(|| {
    builtins_set(&[
        "print",
        "len",
        "range",
        "type",
        "isinstance",
        "int",
        "str",
        "float",
        "bool",
        "list",
        "dict",
        "set",
        "tuple",
        "enumerate",
        "zip",
        "map",
        "filter",
        "sorted",
        "reversed",
        "open",
        "super",
        "getattr",
        "setattr",
        "hasattr",
        "dir",
        "vars",
    ])
});
static RS_BUILTINS: LazyLock<HashSet<&'static str>> = LazyLock::new(|| {
    builtins_set(&[
        "println",
        "print",
        "eprintln",
        "eprint",
        "vec",
        "format",
        "panic",
        "assert",
        "todo",
        "unimplemented",
        "unreachable",
        "dbg",
        "Some",
        "None",
        "Ok",
        "Err",
        "Box",
        "String",
        "Vec",
        "if",
        "for",
        "while",
        "match",
        "return",
    ])
});

fn is_go_builtin(name: &str) -> bool {
    GO_BUILTINS.contains(name)
}
fn is_ts_builtin(name: &str) -> bool {
    TS_BUILTINS.contains(name)
}
fn is_py_builtin(name: &str) -> bool {
    PY_BUILTINS.contains(name)
}
fn is_rs_builtin(name: &str) -> bool {
    RS_BUILTINS.contains(name)
}

#[allow(dead_code)]
pub fn file_base_name(path: &str) -> String {
    let base = std::path::Path::new(path)
        .file_name()
        .map(|s| s.to_string_lossy().to_string())
        .unwrap_or_default();
    let ext = std::path::Path::new(&base)
        .extension()
        .map(|e| format!(".{}", e.to_string_lossy()))
        .unwrap_or_default();
    base.strip_suffix(&ext).unwrap_or(&base).to_string()
}
