//! Port of docsify cobra: scans Go source for `&cobra.Command{}` definitions
//! using tree-sitter-go (the Go original uses go/ast).
use anyhow::{anyhow, Result};
use clap::Args;
use std::collections::{HashMap, HashSet};
use std::io::Write;
use std::path::{Path, PathBuf};
use tree_sitter::{Node, Parser};

#[derive(Args)]
pub struct CobraArgs {
    /// Path to cobra project directory (default: current directory)
    #[arg(long, short = 'f', default_value = "")]
    pub file: String,
    /// Output file path
    #[arg(long, short = 'o', default_value = "README.md")]
    pub output: String,
}

#[derive(Clone, Debug, Default)]
struct FlagDoc {
    name: String,
    shorthand: String,
    default_value: String,
    usage: String,
    persistent: bool,
}

#[derive(Clone, Debug, Default)]
struct CommandDoc {
    full_name: String,
    short: String,
    long: String,
    example: String,
    flags: Vec<FlagDoc>,
    sub_commands: Vec<CommandDoc>,
}

#[derive(Default)]
struct CmdRef {
    doc: CommandDoc,
    var_name: String,
    #[allow(dead_code)]
    func_name: String,
    local_var: String,
    #[allow(dead_code)]
    file_path: PathBuf,
    children: Vec<String>,
}

pub fn run(args: &CobraArgs) -> Result<()> {
    let project = if args.file.is_empty() {
        ".".to_string()
    } else {
        args.file.clone()
    };
    let out = std::fs::File::create(&args.output)?;
    let mut w = std::io::BufWriter::new(out);
    generate_docs(Path::new(&project), &mut w)?;
    w.flush()?;
    println!("Docs written to {}", args.output);
    Ok(())
}

// ---------- tree-sitter helpers ----------

fn parse_go(src: &[u8]) -> Option<tree_sitter::Tree> {
    let mut parser = Parser::new();
    parser.set_language(&tree_sitter_go::LANGUAGE.into()).ok()?;
    parser.parse(src, None)
}

fn text<'a>(node: Node, src: &'a [u8]) -> &'a str {
    node.utf8_text(src).unwrap_or("")
}

fn child_by_kind<'a>(node: Node<'a>, kind: &str) -> Option<Node<'a>> {
    for i in 0..node.child_count() {
        let ch = node.child(i)?;
        if ch.kind() == kind {
            return Some(ch);
        }
    }
    None
}

/// First named child of a call_expression is the function expression.
fn call_function<'a>(node: Node<'a>) -> Option<Node<'a>> {
    (0..node.child_count())
        .filter_map(|i| node.child(i))
        .find(|n| n.is_named() && n.kind() != "argument_list")
}

fn children_of_kind<'a>(node: Node<'a>, kind: &str) -> Vec<Node<'a>> {
    let mut out = Vec::new();
    let mut c = node.walk();
    for n in node.children(&mut c) {
        if n.kind() == kind {
            out.push(n);
        }
    }
    out
}

/// Unquote a Go string literal (interpreted or raw).
fn unquote(s: &str) -> String {
    let s = s.trim();
    if s.len() >= 2 && s.starts_with('`') && s.ends_with('`') {
        return s[1..s.len() - 1].to_string();
    }
    if s.len() >= 2 && s.starts_with('"') && s.ends_with('"') {
        // basic unescape for common cases
        let inner = &s[1..s.len() - 1];
        let mut out = String::with_capacity(inner.len());
        let mut chars = inner.chars();
        while let Some(c) = chars.next() {
            if c == '\\' {
                match chars.next() {
                    Some('n') => out.push('\n'),
                    Some('t') => out.push('\t'),
                    Some('r') => out.push('\r'),
                    Some('\\') => out.push('\\'),
                    Some('"') => out.push('"'),
                    Some('\'') => out.push('\''),
                    Some(other) => {
                        out.push('\\');
                        out.push(other);
                    }
                    None => out.push('\\'),
                }
            } else {
                out.push(c);
            }
        }
        return out;
    }
    s.to_string()
}

/// getStringField: value of `Field: <literal>` inside a composite literal.
fn get_string_field(lit: Node, field: &str, src: &[u8]) -> String {
    // keyed_element nodes are nested inside literal_value; walk descendants
    let mut stack = vec![lit];
    let mut found = Vec::new();
    while let Some(n) = stack.pop() {
        if n.kind() == "keyed_element" {
            found.push(n);
        }
        let mut c = n.walk();
        for ch in n.children(&mut c) {
            stack.push(ch);
        }
    }
    found.sort_by_key(|n| n.start_byte());
    for kv in found {
        // children: literal_element(name) ':' literal_element(value)
        let elems: Vec<Node> = (0..kv.child_count())
            .filter_map(|i| kv.child(i))
            .filter(|n| n.kind() == "literal_element")
            .collect();
        if elems.len() < 2 || text(elems[0], src) != field {
            continue;
        }
        let v = text(elems[1], src);
        if v.starts_with('"') || v.starts_with('`') {
            return unquote(v);
        }
        // Go also accepts CallExpr first-arg literals; literal_element covers
        // the common string case which is all the CLI docs need.
    }
    String::new()
}

fn extract_cmd(lit: Node, src: &[u8]) -> CommandDoc {
    CommandDoc {
        full_name: get_string_field(lit, "Use", src),
        short: get_string_field(lit, "Short", src),
        long: get_string_field(lit, "Long", src),
        example: get_string_field(lit, "Example", src),
        ..Default::default()
    }
}

/// True if composite literal type is a selector ending in `.Command`.
fn is_command_lit(lit: Node, src: &[u8]) -> bool {
    let mut c = lit.walk();
    let ty = lit.children(&mut c).find(|n| n.kind() != "literal_value");
    let Some(ty) = ty else { return false };
    is_command_type(ty, src)
}

fn is_command_type(node: Node, src: &[u8]) -> bool {
    match node.kind() {
        "qualified_type" => {
            // children: package_identifier '.' type_identifier
            (0..node.child_count())
                .filter_map(|i| node.child(i))
                .rfind(|n| n.kind() == "type_identifier")
                .is_some_and(|f| text(f, src) == "Command")
        }
        "selector_expression" => children_of_kind(node, "field_identifier")
            .last()
            .copied()
            .is_some_and(|f| text(f, src) == "Command"),
        "pointer_type" => {
            // children: '*' + the type node
            (0..node.child_count())
                .filter_map(|i| node.child(i))
                .find(|n| n.kind() != "*")
                .is_some_and(|inner| is_command_type(inner, src))
        }
        _ => false,
    }
}

/// funcHasCmdReturn: single result `*pkg.Command`.
fn func_has_cmd_return(fn_node: Node, src: &[u8]) -> bool {
    // tree-sitter-go: result type is a direct child (e.g. pointer_type) before block
    let mut c = fn_node.walk();
    for ch in fn_node.children(&mut c) {
        if ch.kind() == "block" {
            break;
        }
        if matches!(
            ch.kind(),
            "pointer_type" | "selector_expression" | "type_identifier" | "qualified_type"
        ) && is_command_type(ch, src)
        {
            return true;
        }
    }
    false
}

/// identName: identifier text; call_expression -> fun; selector -> field.
fn ident_name(node: Node, src: &[u8]) -> String {
    match node.kind() {
        "identifier" => text(node, src).to_string(),
        "call_expression" => call_function(node)
            .map(|f| ident_name(f, src))
            .unwrap_or_default(),
        "selector_expression" => children_of_kind(node, "field_identifier")
            .last()
            .copied()
            .map(|f| text(f, src).to_string())
            .unwrap_or_default(),
        _ => String::new(),
    }
}

/// qualifiedIdentName: `pkg.Name` for selector with identifier X.
fn qualified_ident_name(node: Node, src: &[u8]) -> String {
    match node.kind() {
        "identifier" => text(node, src).to_string(),
        "call_expression" => call_function(node)
            .map(|f| qualified_ident_name(f, src))
            .unwrap_or_default(),
        "selector_expression" => {
            let mut c = node.walk();
            let mut parts = node.children(&mut c);
            let x = parts.next();
            let field = children_of_kind(node, "field_identifier")
                .last()
                .copied()
                .map(|f| text(f, src).to_string())
                .unwrap_or_default();
            if let Some(xn) = x {
                if xn.kind() == "identifier" {
                    return format!("{}.{}", text(xn, src), field);
                }
            }
            field
        }
        _ => String::new(),
    }
}

/// basicLitString: string literal unquoted, identifier -> name.
fn basic_lit_string(node: Node, src: &[u8]) -> String {
    match node.kind() {
        "interpreted_string_literal" | "raw_string_literal" => unquote(text(node, src)),
        "identifier" => text(node, src).to_string(),
        _ => String::new(),
    }
}

fn extract_flag(method: &str, args: &[Node], src: &[u8]) -> Option<FlagDoc> {
    // arg nodes exclude '(' ')' — argument_list children are the args
    let arg = |i: usize| -> Option<Node> { args.get(i).copied() };
    let (name_idx, shorthand_idx, default_idx, usage_idx, _has_shorthand) = match method {
        "StringP" | "IntP" | "BoolP" | "Float64P" | "DurationP" | "Int32P" | "Int64P"
        | "Uint32P" | "Uint64P" | "StringSliceP" | "IntSliceP" | "Int32SliceP" | "Int64SliceP"
        | "UintSliceP" | "BoolSliceP" | "Float32SliceP" | "DurationSliceP" => {
            (0, Some(1), Some(2), 3, true)
        }
        "String" | "Int" | "Bool" | "Float64" | "Duration" | "Int32" | "Int64" | "Uint32"
        | "Uint64" | "StringSlice" | "IntSlice" | "BoolSlice" => (0, None, Some(1), 2, false),
        "StringToString" => (0, None, Some(1), 2, false),
        "StringToStringP" => (0, Some(1), Some(2), 3, true),
        "StringVarP" | "IntVarP" | "BoolVarP" | "Float64VarP" | "DurationVarP" | "Int32VarP"
        | "Int64VarP" | "Uint32VarP" | "Uint64VarP" => (1, Some(2), Some(3), 4, true),
        "StringVar" | "IntVar" | "BoolVar" | "Float64Var" | "DurationVar" => {
            (1, None, Some(2), 3, false)
        }
        _ => return None,
    };
    let name_node = arg(name_idx)?;
    let name = basic_lit_string(name_node, src);
    if name.is_empty() {
        return None;
    }
    Some(FlagDoc {
        name,
        shorthand: shorthand_idx
            .and_then(arg)
            .map(|n| basic_lit_string(n, src))
            .unwrap_or_default(),
        default_value: default_idx
            .and_then(arg)
            .map(|n| basic_lit_string(n, src))
            .unwrap_or_default(),
        usage: arg(usage_idx)
            .map(|n| basic_lit_string(n, src))
            .unwrap_or_default(),
        persistent: false,
    })
}

/// Find `varName.Flags().Xxx(...)` / `varName.PersistentFlags().Xxx(...)` calls
/// inside `root` (file or func body).
fn find_flags_for_cmd(root: Node, var_name: &str, src: &[u8]) -> Vec<FlagDoc> {
    let mut flags = Vec::new();
    let mut seen: HashSet<String> = HashSet::new();
    let mut stack = vec![root];
    while let Some(node) = stack.pop() {
        if node.kind() == "call_expression" {
            if let Some(fun) = call_function(node) {
                if fun.kind() == "selector_expression" {
                    let method = children_of_kind(fun, "field_identifier")
                        .last()
                        .copied()
                        .map(|f| text(f, src).to_string())
                        .unwrap_or_default();
                    // fun.X where fun is call_expression ident.Flags()/PersistentFlags()
                    if let Some(x) = fun.child(0) {
                        if x.kind() == "call_expression" {
                            if let Some(inner_fun) = call_function(x) {
                                if inner_fun.kind() == "selector_expression" {
                                    let recv = inner_fun.child(0);
                                    let sel = children_of_kind(inner_fun, "field_identifier")
                                        .last()
                                        .copied()
                                        .map(|f| text(f, src).to_string())
                                        .unwrap_or_default();
                                    let is_flags = sel == "Flags" || sel == "PersistentFlags";
                                    let recv_name =
                                        recv.map(|r| ident_name(r, src)).unwrap_or_default();
                                    if is_flags && recv_name == var_name {
                                        let args = child_by_kind(node, "argument_list")
                                            .map(|a| {
                                                let mut v = Vec::new();
                                                let mut c = a.walk();
                                                for ch in a.children(&mut c) {
                                                    if ch.is_named() {
                                                        v.push(ch);
                                                    }
                                                }
                                                v
                                            })
                                            .unwrap_or_default();
                                        if let Some(mut flag) = extract_flag(&method, &args, src) {
                                            flag.persistent = sel == "PersistentFlags";
                                            let key = if flag.shorthand.is_empty() {
                                                flag.name.clone()
                                            } else {
                                                format!("{}-{}", flag.name, flag.shorthand)
                                            };
                                            if seen.insert(key) {
                                                flags.push(flag);
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        let mut c = node.walk();
        for ch in node.children(&mut c) {
            stack.push(ch);
        }
    }
    flags
}

// ---------- command discovery ----------

fn collect_go_files(dir: &Path, out: &mut Vec<PathBuf>) {
    let Ok(entries) = std::fs::read_dir(dir) else {
        return;
    };
    for entry in entries.flatten() {
        let path = entry.path();
        if path.is_dir() {
            collect_go_files(&path, out);
        } else if path.extension().is_some_and(|e| e == "go") {
            out.push(path);
        }
    }
}

fn package_name(root: Node, src: &[u8]) -> String {
    // source_file -> package_clause -> package_identifier
    let mut c = root.walk();
    for n in root.children(&mut c) {
        if n.kind() == "package_clause" {
            let mut c2 = n.walk();
            for ch in n.children(&mut c2) {
                if ch.kind() == "package_identifier" {
                    return text(ch, src).to_string();
                }
            }
        }
    }
    String::new()
}

/// Iterate top-level declaration nodes of a parsed file.
fn top_level_decls(root: Node) -> Vec<Node> {
    let mut out = Vec::new();
    let mut c = root.walk();
    for n in root.children(&mut c) {
        if matches!(
            n.kind(),
            "var_declaration" | "function_declaration" | "method_declaration"
        ) {
            out.push(n);
        }
    }
    out
}

fn find_cmds(dir: &Path) -> Result<(HashMap<String, CmdRef>, HashMap<String, String>)> {
    let mut refs: HashMap<String, CmdRef> = HashMap::new();
    let mut func_to_var: HashMap<String, String> = HashMap::new();
    let skip: HashSet<&str> = ["completion", "help", "docs"].into_iter().collect();

    let mut files = Vec::new();
    collect_go_files(dir, &mut files);

    for path in &files {
        let Ok(src) = std::fs::read(path) else {
            continue;
        };
        let Some(tree) = parse_go(&src) else {
            continue;
        };
        let root = tree.root_node();
        let pkg = package_name(root, &src);

        for decl in top_level_decls(root) {
            match decl.kind() {
                "var_declaration" => {
                    for spec in children_of_kind(decl, "var_spec") {
                        // var_spec: identifier_list '=' expression_list
                        let mut exprs: Vec<Node> = Vec::new();
                        let mut c = spec.walk();
                        for ch in spec.children(&mut c) {
                            if ch.kind() == "expression_list" {
                                let mut c2 = ch.walk();
                                for e in ch.children(&mut c2) {
                                    exprs.push(e);
                                }
                            }
                        }
                        let names: Vec<Node> = children_of_kind(spec, "identifier_list")
                            .first()
                            .map(|il| {
                                let mut v = Vec::new();
                                let mut c3 = il.walk();
                                for ch in il.children(&mut c3) {
                                    if ch.kind() == "identifier" {
                                        v.push(ch);
                                    }
                                }
                                v
                            })
                            .unwrap_or_default();
                        for (i, val) in exprs.iter().enumerate() {
                            if val.kind() != "unary_expression" {
                                continue;
                            }
                            let lit = val
                                .children(&mut val.walk())
                                .find(|n| n.kind() == "composite_literal");
                            let Some(lit) = lit else { continue };
                            if !is_command_lit(lit, &src) {
                                continue;
                            }
                            let name_field = get_string_field(lit, "Use", &src);
                            let name = name_field.split_whitespace().next().unwrap_or("");
                            if name.is_empty() || skip.contains(name) {
                                continue;
                            }
                            let var_name = names
                                .get(i)
                                .map(|n| text(*n, &src).to_string())
                                .unwrap_or_default();
                            let mut doc = extract_cmd(lit, &src);
                            doc.flags = find_flags_for_cmd(spec, &var_name, &src);
                            refs.insert(
                                var_name.clone(),
                                CmdRef {
                                    doc,
                                    var_name,
                                    file_path: path.clone(),
                                    ..Default::default()
                                },
                            );
                        }
                    }
                }
                "function_declaration" => {
                    if !func_has_cmd_return(decl, &src) {
                        continue;
                    }
                    let fn_name = child_by_kind(decl, "identifier")
                        .map(|n| text(n, &src).to_string())
                        .unwrap_or_default();
                    let qualified = format!("{pkg}.{fn_name}");
                    let Some(body) = child_by_kind(decl, "block") else {
                        continue;
                    };
                    let mut found = false;
                    // Pass 1: `x := &cobra.Command{...}` inside body
                    let mut stack = vec![body];
                    while let Some(node) = stack.pop() {
                        if node.kind() == "short_var_declaration"
                            || node.kind() == "assignment_statement"
                        {
                            // find `&cobra.Command{...}` composite literal inside
                            let mut rhs_lit = None;
                            let mut sub = vec![node];
                            while let Some(n2) = sub.pop() {
                                if n2.kind() == "composite_literal"
                                    && n2.parent().is_some_and(|p| p.kind() == "unary_expression")
                                    && is_command_lit(n2, &src)
                                {
                                    rhs_lit = Some(n2);
                                    break;
                                }
                                let mut c3 = n2.walk();
                                for ch2 in n2.children(&mut c3) {
                                    sub.push(ch2);
                                }
                            }
                            if let Some(lit) = rhs_lit {
                                // lhs var: first expression_list's first identifier
                                let lhs_ident = (0..node.child_count())
                                    .filter_map(|i| node.child(i))
                                    .find(|n| n.kind() == "expression_list")
                                    .and_then(|el| {
                                        (0..el.child_count())
                                            .filter_map(|i| el.child(i))
                                            .find(|n| n.kind() == "identifier")
                                    })
                                    .map(|n| text(n, &src).to_string())
                                    .unwrap_or_default();
                                let use_field = get_string_field(lit, "Use", &src);
                                let name = use_field.split_whitespace().next().unwrap_or("");
                                if name.is_empty() || skip.contains(name) {
                                    break;
                                }
                                let mut doc = extract_cmd(lit, &src);
                                doc.flags = find_flags_for_cmd(body, &lhs_ident, &src);
                                refs.insert(
                                    qualified.clone(),
                                    CmdRef {
                                        doc,
                                        func_name: fn_name.clone(),
                                        local_var: lhs_ident,
                                        file_path: path.clone(),
                                        ..Default::default()
                                    },
                                );
                                found = true;
                                break;
                            }
                        }
                        let mut c = node.walk();
                        for ch in node.children(&mut c) {
                            stack.push(ch);
                        }
                    }
                    if found {
                        continue;
                    }
                    // Pass 2: `return &cobra.Command{...}`
                    let mut stack = vec![body];
                    while let Some(node) = stack.pop() {
                        if node.kind() == "return_statement" {
                            let mut found_lit = None;
                            let mut sub = vec![node];
                            while let Some(n2) = sub.pop() {
                                if n2.kind() == "composite_literal"
                                    && n2.parent().is_some_and(|p| p.kind() == "unary_expression")
                                    && is_command_lit(n2, &src)
                                {
                                    found_lit = Some(n2);
                                    break;
                                }
                                let mut c3 = n2.walk();
                                for ch2 in n2.children(&mut c3) {
                                    sub.push(ch2);
                                }
                            }
                            if let Some(lit) = found_lit {
                                let use_field = get_string_field(lit, "Use", &src);
                                let name = use_field.split_whitespace().next().unwrap_or("");
                                if !name.is_empty() && !skip.contains(name) {
                                    refs.insert(
                                        qualified.clone(),
                                        CmdRef {
                                            doc: extract_cmd(lit, &src),
                                            func_name: fn_name.clone(),
                                            file_path: path.clone(),
                                            ..Default::default()
                                        },
                                    );
                                }
                                found = true;
                                break;
                            }
                            // `return ident` where ident is a known cmd var
                            let mut ids = Vec::new();
                            let mut sub = vec![node];
                            while let Some(n2) = sub.pop() {
                                if n2.kind() == "identifier" {
                                    ids.push(text(n2, &src).to_string());
                                }
                                let mut c3 = n2.walk();
                                for ch2 in n2.children(&mut c3) {
                                    sub.push(ch2);
                                }
                            }
                            if let Some(var_name) = ids.last() {
                                if refs.contains_key(var_name.as_str()) {
                                    func_to_var.insert(qualified.clone(), var_name.clone());
                                    found = true;
                                    break;
                                }
                            }
                        }
                        let mut c = node.walk();
                        for ch in node.children(&mut c) {
                            stack.push(ch);
                        }
                    }
                    let _ = found;
                }
                _ => {}
            }
        }
    }

    // Second pass over all files: flag backfill + AddCommand wiring
    // (Go runs findAddCalls as a separate walk after findCmds).
    for path in &files {
        let Ok(src) = std::fs::read(path) else {
            continue;
        };
        let Some(tree) = parse_go(&src) else {
            continue;
        };
        let root = tree.root_node();
        let pkg = package_name(root, &src);
        find_add_calls_in_file(root, &src, &pkg, &mut refs, &mut func_to_var);
    }

    Ok((refs, func_to_var))
}

/// Flag backfill for var-declared commands + AddCommand wiring.
/// AddCommand calls are resolved per enclosing function so local `cmd`
/// variables map back to the function's qualified ref (Go inspects per-FuncDecl).
fn find_add_calls_in_file(
    root: Node,
    src: &[u8],
    pkg: &str,
    refs: &mut HashMap<String, CmdRef>,
    func_to_var: &mut HashMap<String, String>,
) {
    // Backfill flags for var refs using the whole file
    let var_keys: Vec<String> = refs
        .iter()
        .filter(|(_, r)| !r.var_name.is_empty() && r.doc.flags.is_empty())
        .map(|(k, _)| k.clone())
        .collect();
    for key in var_keys {
        let var_name = refs[&key].var_name.clone();
        let flags = find_flags_for_cmd(root, &var_name, src);
        if let Some(r) = refs.get_mut(&key) {
            r.doc.flags = flags;
        }
    }

    let mut fns: Vec<Node> = Vec::new();
    let mut stack = vec![root];
    while let Some(node) = stack.pop() {
        if node.kind() == "function_declaration" || node.kind() == "method_declaration" {
            fns.push(node);
        }
        let mut c = node.walk();
        for ch in node.children(&mut c) {
            stack.push(ch);
        }
    }
    for fnode in fns {
        let fn_name = child_by_kind(fnode, "identifier")
            .map(|n| text(n, src).to_string())
            .unwrap_or_default();
        let qualified = format!("{pkg}.{fn_name}");
        let mut stack = vec![fnode];
        while let Some(node) = stack.pop() {
            if node.kind() == "call_expression" {
                if let Some(fun) = call_function(node) {
                    if fun.kind() == "selector_expression" {
                        let sel = children_of_kind(fun, "field_identifier")
                            .last()
                            .copied()
                            .map(|f| text(f, src).to_string())
                            .unwrap_or_default();
                        if sel == "AddCommand" {
                            let parent_name =
                                fun.child(0).map(|r| ident_name(r, src)).unwrap_or_default();
                            let mut parent_key = parent_name.clone();
                            if !refs.contains_key(&parent_key) {
                                if let Some(r) = refs.get(&qualified) {
                                    if r.local_var == parent_name {
                                        parent_key = qualified.clone();
                                    }
                                }
                            }
                            if refs.contains_key(&parent_key) {
                                if let Some(args) = child_by_kind(node, "argument_list") {
                                    let mut c = args.walk();
                                    for arg in args.children(&mut c) {
                                        if !arg.is_named() {
                                            continue;
                                        }
                                        let mut child_name = qualified_ident_name(arg, src);
                                        if !refs.contains_key(&child_name) {
                                            let pkg_q = format!("{pkg}.{child_name}");
                                            if refs.contains_key(&pkg_q) {
                                                child_name = pkg_q;
                                            } else if let Some(target) = func_to_var.get(&pkg_q) {
                                                child_name = target.clone();
                                            }
                                        }
                                        if refs.contains_key(&child_name) {
                                            refs.get_mut(&parent_key)
                                                .unwrap()
                                                .children
                                                .push(child_name);
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            let mut c = node.walk();
            for ch in node.children(&mut c) {
                stack.push(ch);
            }
        }
    }
}

// ---------- tree building + rendering ----------

fn build_tree(refs: &HashMap<String, CmdRef>) -> Vec<CommandDoc> {
    let mut child_set: HashSet<String> = HashSet::new();
    for r in refs.values() {
        for c in &r.children {
            child_set.insert(c.clone());
        }
    }
    let mut roots = Vec::new();
    for name in refs.keys() {
        if child_set.contains(name) {
            continue;
        }
        roots.push(wire_tree(name, refs, &mut HashSet::new()));
    }
    roots.sort_by(|a, b| a.full_name.cmp(&b.full_name));
    roots
}

fn wire_tree(
    name: &str,
    refs: &HashMap<String, CmdRef>,
    visited: &mut HashSet<String>,
) -> CommandDoc {
    if !visited.insert(name.to_string()) {
        return CommandDoc::default();
    }
    let Some(r) = refs.get(name) else {
        return CommandDoc::default();
    };
    let mut doc = r.doc.clone();
    for c in &r.children {
        let child = wire_tree(c, refs, visited);
        if !child.full_name.is_empty() {
            doc.sub_commands.push(child);
        }
    }
    doc
}

fn render_toc_entry(
    w: &mut impl Write,
    doc: &CommandDoc,
    parent: &str,
    indent: &str,
    flag_count: &mut usize,
) -> Result<()> {
    let base = doc.full_name.split_whitespace().next().unwrap_or("");
    let heading = format!("{parent} {base}");
    let anchor = heading.to_lowercase().replace(' ', "-");
    writeln!(w, "{indent}- [`{heading}`](#{anchor})")?;
    if !doc.flags.is_empty() {
        if *flag_count == 0 {
            writeln!(w, "{indent}  - [Flags](#flags)")?;
        } else {
            writeln!(w, "{indent}  - [Flags](#flags-{flag_count})")?;
        }
        *flag_count += 1;
    }
    for sub in &doc.sub_commands {
        render_toc_entry(w, sub, &heading, &format!("{indent}  "), flag_count)?;
    }
    Ok(())
}

fn render_flags(w: &mut impl Write, flags: &[FlagDoc], level: usize) -> Result<()> {
    if flags.is_empty() {
        return Ok(());
    }
    writeln!(w, "{} Flags\n", "#".repeat(level + 1))?;
    writeln!(w, "| Flag | Shorthand | Default | Description |")?;
    writeln!(w, "|------|-----------|---------|-------------|")?;
    for f in flags {
        let shorthand = if f.shorthand.is_empty() {
            String::new()
        } else {
            format!("-{}", f.shorthand)
        };
        let mut flag_name = format!("--{}", f.name);
        if f.persistent {
            flag_name.push_str(" (persistent)");
        }
        writeln!(
            w,
            "| `{flag_name}` | `{shorthand}` | `{}` | {} |",
            f.default_value, f.usage
        )?;
    }
    writeln!(w)?;
    Ok(())
}

fn render_command(w: &mut impl Write, doc: &CommandDoc, level: usize, parent: &str) -> Result<()> {
    let base = doc.full_name.split_whitespace().next().unwrap_or("");
    let mut full_usage = format!("{parent} {base}");
    let use_parts: Vec<&str> = doc.full_name.split_whitespace().collect();
    if use_parts.len() > 1 {
        full_usage.push(' ');
        full_usage.push_str(&use_parts[1..].join(" "));
    }
    let full_usage = full_usage.trim().to_string();
    let heading_text = format!("{parent} {base}");

    writeln!(w, "{} `{heading_text}`\n", "#".repeat(level))?;
    if !doc.short.is_empty() {
        writeln!(w, "{}\n", doc.short)?;
    }
    if !doc.long.is_empty() {
        writeln!(w, "{}\n", doc.long.trim())?;
    }
    writeln!(w, "```bash\n{full_usage}\n```\n")?;
    render_flags(w, &doc.flags, level)?;
    if !doc.example.is_empty() {
        writeln!(w, "Example:\n\n```bash\n{}\n```\n", doc.example)?;
    }
    writeln!(w, "---\n")?;
    for sub in &doc.sub_commands {
        render_command(w, sub, level + 1, &full_usage)?;
    }
    Ok(())
}

fn generate_docs(project_path: &Path, w: &mut impl Write) -> Result<()> {
    let (refs, func_to_var) = find_cmds(project_path)?;
    // AddCommand pass already ran per-file inside find_cmds; Go runs it as a
    // separate full walk — our per-file pass covers the same ground.
    let _ = func_to_var;

    let roots = build_tree(&refs);
    if roots.is_empty() {
        return Err(anyhow!(
            "no cobra commands found in {}",
            project_path.display()
        ));
    }
    let root = &roots[0];
    let root_name = root
        .full_name
        .split_whitespace()
        .next()
        .unwrap_or("")
        .to_string();

    writeln!(w, "# `{root_name}`\n")?;
    if !root.short.is_empty() {
        writeln!(w, "{}\n", root.short)?;
    }
    if !root.long.is_empty() && root.long != root.short {
        writeln!(w, "{}\n", root.long.trim())?;
    }
    render_flags(w, &root.flags, 1)?;
    writeln!(w, "---\n")?;

    if !root.sub_commands.is_empty() {
        writeln!(w, "## Table of Contents\n")?;
        let mut flag_count = 0;
        writeln!(w, "- [`{root_name}`](#{root_name})")?;
        writeln!(w, "  - [Table of Contents](#table-of-contents)")?;
        for sub in &root.sub_commands {
            render_toc_entry(w, sub, &root_name, "  ", &mut flag_count)?;
        }
        writeln!(w)?;
    }

    for sub in &root.sub_commands {
        render_command(w, sub, 2, &root_name)?;
    }
    Ok(())
}
