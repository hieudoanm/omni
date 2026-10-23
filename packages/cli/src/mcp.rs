use crate::cli;
use anyhow::Result;
use clap::{Args as ClapArgs, Subcommand};
use serde_json::{json, Map, Value};
use std::io::{BufRead, Write};
use std::process::Command;

const PROTOCOL_VERSION: &str = "2025-11-25";
const MAX_FRAME_BYTES: usize = 8 << 20;
const SKIP_NAMES: [&str; 3] = ["help", "completion", "mcp"];

#[derive(ClapArgs)]
#[command(about = "MCP server exposing CLI tools to AI agents")]
pub struct McpArgs {
    #[command(subcommand)]
    pub command: Option<McpCommand>,
}

#[derive(Subcommand)]
pub enum McpCommand {
    /// Start the MCP server over stdio
    Serve,
}

#[derive(Clone, Copy, PartialEq)]
enum FlagKind {
    Bool,
    Array,
    Value,
}

struct Tool {
    name: String,
    argv: Vec<String>,
    description: String,
    schema: Value,
    flags: Map<String, Value>,
}

fn flag_kind(arg: &clap::Arg) -> FlagKind {
    use clap::builder::ArgAction::*;
    match arg.get_action() {
        SetTrue | SetFalse => FlagKind::Bool,
        Append => FlagKind::Array,
        _ => FlagKind::Value,
    }
}

fn flag_json_type(arg: &clap::Arg) -> &'static str {
    match flag_kind(arg) {
        FlagKind::Bool => "boolean",
        FlagKind::Array => "array",
        FlagKind::Value => {
            let dbg = format!("{:?}", arg.get_value_parser());
            if dbg.contains("i64")
                || dbg.contains("u64")
                || dbg.contains("usize")
                || dbg.contains("isize")
            {
                "integer"
            } else if dbg.contains("f64") || dbg.contains("f32") {
                "number"
            } else {
                "string"
            }
        }
    }
}

fn arg_prop_name(arg: &clap::Arg) -> String {
    arg.get_long()
        .map(|s| s.to_string())
        .unwrap_or_else(|| arg.get_id().as_str().to_string())
}

fn build_schema(
    cmd: &clap::Command,
    inherited_globals: &[clap::Arg],
) -> (Value, Map<String, Value>) {
    let mut props = Map::new();
    let mut flags = Map::new();
    let mut seen = std::collections::HashSet::new();
    // Inherited global args first, then the command's own args (own wins on dup).
    let own_args: Vec<&clap::Arg> = cmd.get_arguments().collect();
    let effective: Vec<&clap::Arg> = inherited_globals
        .iter()
        .chain(own_args.iter().copied())
        .collect();
    for arg in effective.into_iter().rev() {
        if arg.get_index().is_some() {
            continue; // positionals are exposed via _args
        }
        let name = arg_prop_name(arg);
        if name == "help" || !seen.insert(name.clone()) {
            continue;
        }
        let kind = flag_kind(arg);
        let mut prop = Map::new();
        prop.insert("type".into(), Value::from(flag_json_type(arg)));
        let help = arg
            .get_help()
            .map(|h| h.to_string())
            .or_else(|| arg.get_long_help().map(|h| h.to_string()))
            .unwrap_or_default();
        if !help.is_empty() {
            prop.insert("description".into(), Value::from(help));
        }
        if kind == FlagKind::Array {
            prop.insert("items".into(), json!({"type": "string"}));
        }
        if kind != FlagKind::Bool {
            if let Some(def) = arg.get_default_values().first() {
                let def = def.to_string_lossy().to_string();
                if !def.is_empty() && def != "0" {
                    prop.insert("default".into(), Value::from(def));
                }
            }
        }
        let possible: Vec<String> = arg
            .get_possible_values()
            .iter()
            .map(|p| p.get_name().to_string())
            .collect();
        if !possible.is_empty() {
            prop.insert(
                "enum".into(),
                Value::Array(possible.iter().map(|s| Value::from(s.clone())).collect()),
            );
        }
        flags.insert(
            name.clone(),
            Value::from(match kind {
                FlagKind::Bool => "bool",
                FlagKind::Array => "array",
                FlagKind::Value => "value",
            }),
        );
        props.insert(name, Value::Object(prop));
    }
    props.insert(
        "_args".into(),
        json!({
            "type": "array",
            "description": "Positional command-line arguments",
            "items": {"type": "string"},
        }),
    );
    (
        json!({"type": "object", "properties": Value::Object(props)}),
        flags,
    )
}

fn strip_ansi(s: &str) -> String {
    let mut out = String::with_capacity(s.len());
    let mut chars = s.chars();
    while let Some(c) = chars.next() {
        if c == '\u{1b}' {
            for c2 in chars.by_ref() {
                if c2.is_ascii_alphabetic() {
                    break;
                }
            }
        } else {
            out.push(c);
        }
    }
    out
}

fn command_usage(cmd: &clap::Command) -> String {
    strip_ansi(&cmd.clone().render_usage().to_string())
        .lines()
        .next()
        .unwrap_or("")
        .trim_start_matches("Usage:")
        .trim()
        .to_string()
}

fn discover(
    cmd: &clap::Command,
    name: &str,
    argv: &[String],
    tools: &mut Vec<Tool>,
    globals: &[clap::Arg],
) {
    let about = cmd
        .get_long_about()
        .map(|s| s.to_string())
        .or_else(|| cmd.get_about().map(|s| s.to_string()))
        .unwrap_or_default();
    let mut description = about;
    let usage = command_usage(cmd);
    if !usage.is_empty() {
        if !description.is_empty() {
            description.push_str("\n\n");
        }
        description.push_str("Usage: ");
        description.push_str(&usage);
    }
    let (schema, flags) = build_schema(cmd, globals);
    tools.push(Tool {
        name: name.to_string(),
        argv: argv.to_vec(),
        description,
        schema,
        flags,
    });
    let mut child_globals: Vec<clap::Arg> = globals.to_vec();
    for arg in cmd.get_arguments() {
        if arg.is_global_set() {
            child_globals.retain(|a| arg_prop_name(a) != arg_prop_name(arg));
            child_globals.push(arg.clone());
        }
    }
    for sub in cmd.get_subcommands() {
        let sub_name = sub.get_name();
        if SKIP_NAMES.contains(&sub_name) {
            continue;
        }
        let mut child_argv = argv.to_vec();
        child_argv.push(sub_name.to_string());
        discover(
            sub,
            &format!("{name}.{sub_name}"),
            &child_argv,
            tools,
            &child_globals,
        );
    }
}

fn discover_tools() -> Vec<Tool> {
    let root = cli::command();
    let mut tools = Vec::new();
    for sub in root.get_subcommands() {
        let name = sub.get_name();
        if SKIP_NAMES.contains(&name) {
            continue;
        }
        discover(sub, name, &[name.to_string()], &mut tools, &[]);
    }
    tools.sort_by(|a, b| a.name.cmp(&b.name));
    tools
}

fn value_to_arg_string(v: &Value) -> String {
    match v {
        Value::String(s) => s.clone(),
        Value::Number(n) => n.to_string(),
        Value::Bool(b) => b.to_string(),
        Value::Null => String::new(),
        other => serde_json::to_string(other).unwrap_or_default(),
    }
}

fn build_argv(tool: &Tool, arguments: &Value) -> Vec<String> {
    let mut argv = tool.argv.clone();
    let mut pos_args = Vec::new();
    if let Some(obj) = arguments.as_object() {
        for (key, value) in obj {
            if key == "_args" {
                if let Some(arr) = value.as_array() {
                    for a in arr {
                        pos_args.push(value_to_arg_string(a));
                    }
                }
                continue;
            }
            let kind = tool
                .flags
                .get(key)
                .and_then(|k| k.as_str())
                .unwrap_or("value");
            match kind {
                "bool" => {
                    if value.as_bool() == Some(true) {
                        argv.push(format!("--{key}"));
                    }
                }
                "array" => {
                    if let Some(arr) = value.as_array() {
                        for item in arr {
                            argv.push(format!("--{key}={}", value_to_arg_string(item)));
                        }
                    } else {
                        argv.push(format!("--{key}={}", value_to_arg_string(value)));
                    }
                }
                _ => {
                    argv.push(format!("--{key}={}", value_to_arg_string(value)));
                }
            }
        }
    }
    argv.extend(pos_args);
    argv
}

fn execute_tool(tool: &Tool, arguments: &Value) -> Value {
    let argv = build_argv(tool, arguments);
    let exe = match std::env::current_exe() {
        Ok(e) => e,
        Err(e) => return tool_error(&format!("cannot locate omni binary: {e}")),
    };
    let output = Command::new(exe)
        .args(&argv)
        .env("OMNI_MCP_SOURCE", "mcp")
        .output();
    let output = match output {
        Ok(o) => o,
        Err(e) => return tool_error(&format!("failed to execute {}: {e}", argv.join(" "))),
    };
    let stdout = String::from_utf8_lossy(&output.stdout).trim().to_string();
    let stderr = String::from_utf8_lossy(&output.stderr).trim().to_string();
    let mut text = stdout;
    if !output.status.success() && !stderr.is_empty() {
        if !text.is_empty() {
            text.push('\n');
        }
        text.push_str(&stderr);
    }
    if !output.status.success() {
        if text.is_empty() {
            text = format!("command failed with status {}", output.status);
        }
        return tool_error(text.trim());
    }
    tool_text(text.trim())
}

fn tool_text(text: &str) -> Value {
    json!({
        "content": [{"type": "text", "text": text}],
    })
}

fn tool_error(text: &str) -> Value {
    json!({
        "content": [{"type": "text", "text": text}],
        "isError": true,
    })
}

fn response(id: &Value, result: Value) -> Value {
    json!({"jsonrpc": "2.0", "id": id, "result": result})
}

fn error_response(id: &Value, code: i64, message: &str) -> Value {
    json!({"jsonrpc": "2.0", "id": id, "error": {"code": code, "message": message}})
}

fn object_or_empty(params: Option<&Value>) -> Value {
    match params {
        Some(Value::Object(_)) => params.cloned().unwrap(),
        _ => json!({}),
    }
}

fn handle_message(line: &str, tools: &[Tool], out: &mut dyn Write) {
    let msg: Value = match serde_json::from_str(line) {
        Ok(v) => v,
        Err(e) => {
            let _ = writeln!(
                out,
                "{}",
                error_response(&Value::Null, -32700, &format!("parse error: {e}"))
            );
            return;
        }
    };
    let id = msg.get("id").cloned().unwrap_or(Value::Null);
    let is_notification = id.is_null();
    if is_notification {
        return;
    }
    if msg.get("jsonrpc").and_then(|v| v.as_str()) != Some("2.0") {
        let _ = writeln!(
            out,
            "{}",
            error_response(&id, -32600, "invalid jsonrpc version")
        );
        return;
    }
    let method = msg.get("method").and_then(|m| m.as_str()).unwrap_or("");
    let params = msg.get("params");
    match method {
        "initialize" => {
            // Only one protocol revision is supported; echo it back regardless of
            // what the client requested (the client disconnects if it cannot speak it).
            let _ = params;
            let _ = writeln!(
                out,
                "{}",
                response(
                    &id,
                    json!({
                        "protocolVersion": PROTOCOL_VERSION,
                        "capabilities": {"tools": {"listChanged": false}},
                        "serverInfo": {"name": "omni-mcp", "version": "1.0.0"},
                    })
                )
            );
        }
        "ping" => {
            let _ = writeln!(out, "{}", response(&id, json!({})));
        }
        "tools/list" => {
            let list: Vec<Value> = tools
                .iter()
                .map(|t| {
                    json!({
                        "name": t.name,
                        "description": t.description,
                        "inputSchema": t.schema,
                    })
                })
                .collect();
            let _ = writeln!(out, "{}", response(&id, json!({"tools": list})));
        }
        "tools/call" => {
            let params = object_or_empty(params);
            let name = params.get("name").and_then(|n| n.as_str()).unwrap_or("");
            let tool = tools.iter().find(|t| t.name == name);
            match tool {
                None => {
                    let _ = writeln!(
                        out,
                        "{}",
                        error_response(&id, -32601, &format!("tool not found: {name}"))
                    );
                }
                Some(t) => {
                    let arguments = params
                        .get("arguments")
                        .cloned()
                        .unwrap_or_else(|| json!({}));
                    let result = execute_tool(t, &arguments);
                    let _ = writeln!(out, "{}", response(&id, result));
                }
            }
        }
        _ => {
            let _ = writeln!(
                out,
                "{}",
                error_response(&id, -32601, &format!("method not found: {method}"))
            );
        }
    }
}

fn serve() -> Result<()> {
    let tools = discover_tools();
    eprintln!("[mcp] omni-mcp serving {} tools", tools.len());
    let stdin = std::io::stdin();
    let stdout = std::io::stdout();
    let mut out = stdout.lock();
    for line in stdin.lock().lines() {
        let line = line?;
        if line.len() > MAX_FRAME_BYTES {
            let _ = writeln!(
                out,
                "{}",
                error_response(&Value::Null, -32700, "parse error: frame too large")
            );
            continue;
        }
        let trimmed = line.trim();
        if trimmed.is_empty() {
            continue;
        }
        handle_message(trimmed, &tools, &mut out);
        out.flush()?;
    }
    Ok(())
}

pub fn run(args: &McpArgs) -> Result<()> {
    match &args.command {
        Some(McpCommand::Serve) | None => serve(),
    }
}
