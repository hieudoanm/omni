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

/// All four MCP hints for a tool, always serialized with camelCase keys.
fn annotations_for(name: &str) -> Value {
    let (read_only, destructive, idempotent, open_world) = hints_for(name);
    json!({
        "readOnlyHint": read_only,
        "destructiveHint": destructive,
        "idempotentHint": idempotent,
        "openWorldHint": open_world,
    })
}

/// Hint tuple: (read_only, destructive, idempotent, open_world).
///
/// Tools are discovered from the clap tree, so hints are classified by name.
/// The default is a local, read-only, idempotent call; overrides below cover
/// file-writing commands, remote APIs, interactive sessions, and random output.
fn hints_for(name: &str) -> (bool, bool, bool, bool) {
    const RO: (bool, bool, bool, bool) = (true, false, true, false);
    const OPEN_RO: (bool, bool, bool, bool) = (true, false, true, true);
    const WRITE: (bool, bool, bool, bool) = (false, false, true, false);
    const OPEN_WRITE: (bool, bool, bool, bool) = (false, false, false, true);

    // Commands that write files or clear local state.
    match name {
        "history.clear" => return (false, true, true, false),
        "file.write" | "file.chmod" => return WRITE,
        "file.edit" => return (false, false, false, false),
        "data.archive" | "data.ebook" | "data.excel.to-csv" | "data.split" => return WRITE,
        "docsify.cobra" | "docsify.obsidian" | "docsify.scan" | "docsify.tree" => return WRITE,
        "openapi.openapi2postman" => return WRITE,
        "net.serve" | "openrouter.serve" | "openrouter.hook" | "openrouter.code" => {
            return OPEN_WRITE;
        }
        _ => {}
    }
    if name.starts_with("image.") && !matches!(name, "image.info" | "image.dominant") {
        return WRITE;
    }
    if name.starts_with("pdf.") && !name.starts_with("pdf.inspect") && name != "pdf.extract.text" {
        return WRITE;
    }
    if name.starts_with("video.") {
        return WRITE;
    }
    if matches!(
        name,
        "web.snapshot"
            | "web.simplify"
            | "web.simplify.md"
            | "web.simplify.csv"
            | "web.simplify.images"
            | "web.youtube.fetch"
            | "web.youtube.thumbnails"
    ) {
        return (false, false, true, true);
    }
    // gh.* commands fetch repo data and write an SVG/text output file.
    if name.starts_with("gh.") {
        return (false, false, true, true);
    }
    if name.starts_with("telegram.") {
        return telegram_hints(name);
    }
    // OpenRouter/Gemini chat TUIs are interactive and non-deterministic.
    if name == "gemini.code" {
        return (true, false, false, true);
    }
    // LLM rewrites are read-only but non-deterministic.
    if name.starts_with("write.") {
        return (true, false, false, true);
    }
    // Commands whose output is random or interactive: same args, new result.
    if is_non_idempotent(name) {
        return (true, false, false, open_world(name));
    }
    if open_world(name) {
        return OPEN_RO;
    }
    RO
}

/// Bot API calls that only read remote state.
fn telegram_read_only(name: &str) -> bool {
    matches!(
        name,
        "telegram.bot.get-me"
            | "telegram.chat.get"
            | "telegram.game.high-scores"
            | "telegram.webhook.info"
    )
}

/// Remote mutations that irreversibly delete or revoke data.
fn telegram_destructive(name: &str) -> bool {
    matches!(
        name,
        "telegram.message.delete"
            | "telegram.webhook.delete"
            | "telegram.forum.delete"
            | "telegram.forum.close"
            | "telegram.chat.ban"
            | "telegram.chat.revoke-invite-link"
            | "telegram.sticker.remove-from-set"
            | "telegram.chat.leave"
    )
}

fn telegram_hints(name: &str) -> (bool, bool, bool, bool) {
    if telegram_read_only(name) {
        return (true, false, true, true);
    }
    if telegram_destructive(name) {
        return (false, true, true, true);
    }
    // Sends, edits, pins, webhook/config sets: remote mutations that are not
    // safely repeatable (a second send delivers a second message).
    (false, false, false, true)
}

/// True when the command reaches an external network service.
fn open_world(name: &str) -> bool {
    const PREFIXES: &[&str] = &[
        "english.",
        "doi.",
        "port.",
        "write.",
        "chess.com.",
        "chess.lichess.",
        "search.web",
        "web.",
        "gemini.",
        "openrouter.",
    ];
    name == "calc.currency"
        || (name.starts_with("net.") && name != "net.wifi")
        || PREFIXES.iter().any(|p| name.starts_with(p))
}

/// True for commands whose output differs between identical invocations
/// (RNG, wall-clock sessions, interactive prompts) but that mutate nothing.
fn is_non_idempotent(name: &str) -> bool {
    if name.starts_with("games.") {
        return true;
    }
    if name.starts_with("casino.") {
        // Rules/reference commands are deterministic; rolls, odds and the
        // play TUIs are not.
        return matches!(
            name,
            "casino.coin"
                | "casino.dice"
                | "casino.roulette"
                | "casino.slots"
                | "casino.slots.play"
                | "casino.poker.odds"
                | "casino.blackjack.play"
                | "casino.poker.play"
                | "casino.baccarat.play"
        );
    }
    matches!(
        name,
        "calc.random"
            | "colors.random"
            | "colors.palette"
            | "convert.lorem"
            | "crypto.uuid"
            | "crypto.keygen"
            | "crypto.passwd"
            | "crypto.totp"
            | "chess.play"
            | "chess.setup"
            | "chess.chess960.random"
            | "time.pomodoro"
            | "time.stopwatch"
            | "time.timer"
    )
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
                        "annotations": annotations_for(&t.name),
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

#[cfg(test)]
mod tests {
    use super::*;

    fn listed_tools() -> Vec<Value> {
        let tools = discover_tools();
        assert!(!tools.is_empty());
        let mut out: Vec<u8> = Vec::new();
        handle_message(
            r#"{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}"#,
            &tools,
            &mut out,
        );
        let reply: Value = serde_json::from_slice(&out).expect("tools/list reply");
        reply["result"]["tools"]
            .as_array()
            .expect("tools array")
            .clone()
    }

    #[test]
    fn tools_list_includes_expected_tools() {
        let tools = listed_tools();
        let names: Vec<&str> = tools
            .iter()
            .map(|t| t["name"].as_str().expect("tool name"))
            .collect();
        for expected in [
            "convert.base64.encode",
            "file.read",
            "file.write",
            "history.clear",
            "net.serve",
            "search.web",
            "telegram.message.send",
            "version",
        ] {
            assert!(names.contains(&expected), "missing tool {expected}");
        }
    }

    #[test]
    fn every_tool_declares_all_four_hints() {
        for tool in listed_tools() {
            let name = tool["name"].as_str().expect("tool name");
            let annotations = &tool["annotations"];
            for hint in [
                "readOnlyHint",
                "destructiveHint",
                "idempotentHint",
                "openWorldHint",
            ] {
                assert!(
                    annotations.get(hint).is_some_and(Value::is_boolean),
                    "{name} missing boolean annotation {hint}: {annotations}"
                );
            }
        }
    }

    #[test]
    fn hints_reflect_command_semantics() {
        let tools = listed_tools();
        let hints = |name: &str| -> Value {
            tools
                .iter()
                .find(|t| t["name"] == name)
                .unwrap_or_else(|| panic!("missing tool {name}"))["annotations"]
                .clone()
        };
        // Pure local reads.
        assert_eq!(
            hints("convert.base64.encode"),
            json!({
                "readOnlyHint": true,
                "destructiveHint": false,
                "idempotentHint": true,
                "openWorldHint": false,
            })
        );
        // Local file writes: not read-only, still idempotent.
        assert_eq!(hints("file.write")["readOnlyHint"], json!(false));
        assert_eq!(hints("file.write")["idempotentHint"], json!(true));
        assert_eq!(hints("image.resize")["readOnlyHint"], json!(false));
        assert_eq!(hints("pdf.extract.text")["readOnlyHint"], json!(true));
        // Destructive local delete.
        assert_eq!(hints("history.clear")["destructiveHint"], json!(true));
        assert_eq!(hints("history.clear")["readOnlyHint"], json!(false));
        // Remote reads vs remote mutations.
        assert_eq!(hints("search.web")["openWorldHint"], json!(true));
        assert_eq!(hints("search.web")["readOnlyHint"], json!(true));
        assert_eq!(hints("telegram.message.send")["openWorldHint"], json!(true));
        assert_eq!(hints("telegram.message.send")["readOnlyHint"], json!(false));
        assert_eq!(
            hints("telegram.message.delete")["destructiveHint"],
            json!(true)
        );
        assert_eq!(hints("telegram.bot.get-me")["readOnlyHint"], json!(true));
        // Servers and remote config are neither read-only nor idempotent.
        for name in ["net.serve", "openrouter.serve", "openrouter.code"] {
            let ann = hints(name);
            assert_eq!(ann["readOnlyHint"], json!(false), "{name}");
            assert_eq!(ann["idempotentHint"], json!(false), "{name}");
            assert_eq!(ann["openWorldHint"], json!(true), "{name}");
        }
        // Random/interactive tools are read-only but not idempotent.
        for name in ["calc.random", "games.wordle", "crypto.uuid"] {
            let ann = hints(name);
            assert_eq!(ann["readOnlyHint"], json!(true), "{name}");
            assert_eq!(ann["idempotentHint"], json!(false), "{name}");
        }
        assert_eq!(hints("net.wifi")["openWorldHint"], json!(false));
    }

    #[test]
    fn tools_call_unknown_tool_returns_error() {
        let tools = discover_tools();
        let mut out: Vec<u8> = Vec::new();
        handle_message(
            r#"{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"no.such.tool","arguments":{}}}"#,
            &tools,
            &mut out,
        );
        let reply: Value = serde_json::from_slice(&out).expect("tools/call reply");
        assert_eq!(reply["error"]["code"], json!(-32601));
    }

    #[test]
    fn build_argv_maps_flags_and_positionals() {
        let tools = discover_tools();
        let tool = tools
            .iter()
            .find(|t| t.name == "file.read")
            .expect("file.read tool");
        let argv = build_argv(
            tool,
            &json!({"file": "main.rs", "lines": 5, "_args": ["extra"]}),
        );
        assert_eq!(
            argv,
            vec!["file", "read", "--file=main.rs", "--lines=5", "extra"]
        );
    }

    #[test]
    fn notifications_get_no_response() {
        let tools = discover_tools();
        let mut out: Vec<u8> = Vec::new();
        handle_message(r#"{"jsonrpc":"2.0","method":"ping"}"#, &tools, &mut out);
        assert!(out.is_empty());
    }
}
