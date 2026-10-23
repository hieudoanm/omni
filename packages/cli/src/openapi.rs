use anyhow::{anyhow, Result};
use clap::{Args as ClapArgs, Subcommand};
use serde_json::{Map, Value};
use std::collections::BTreeMap;

#[derive(ClapArgs)]
#[command(
    about = "OpenAPI related tools",
    long_about = "Tools for interacting with and managing OpenAPI specifications."
)]
pub struct OpenapiArgs {
    #[command(subcommand)]
    pub command: Option<OpenapiCommand>,
    /// Output in JSON format
    #[arg(long, short = 'j', global = true)]
    pub json: bool,
}

#[derive(Subcommand)]
pub enum OpenapiCommand {
    /// Convert OpenAPI to Postman collection
    #[command(name = "openapi2postman")]
    Openapi2postman(PostmanArgs),
    /// Validate an OpenAPI specification
    Validate(ValidateArgs),
}

#[derive(clap::Args)]
pub struct ValidateArgs {
    /// OpenAPI spec file
    #[arg(long, short = 'f', default_value = "")]
    pub file: String,
}

#[derive(clap::Args)]
pub struct PostmanArgs {
    /// OpenAPI file (json/yaml)
    #[arg(long, short = 'i', default_value = "")]
    pub input: String,
    /// Output Postman file
    #[arg(long, short = 'o', default_value = "")]
    pub output: String,
}

fn get_string(v: &Value) -> String {
    v.as_str().unwrap_or("").to_string()
}

fn parse_openapi(data: &[u8]) -> Result<Value> {
    if let Ok(spec) = serde_json::from_slice::<Value>(data) {
        return Ok(spec);
    }
    let spec: Value = serde_yml::from_slice(data)?;
    if spec.is_object() {
        Ok(spec)
    } else {
        Err(anyhow!("failed to parse OpenAPI spec"))
    }
}

fn schema_to_example(schema: Option<&Value>) -> Value {
    let Some(schema) = schema else {
        return Value::Null;
    };
    if let Some(ex) = schema.get("example") {
        return ex.clone();
    }
    if let Some(def) = schema.get("default") {
        return def.clone();
    }
    match schema.get("type").and_then(|t| t.as_str()).unwrap_or("") {
        "string" => {
            if let Some(Value::Array(enum_vals)) = schema.get("enum") {
                if let Some(first) = enum_vals.first() {
                    return first.clone();
                }
            }
            Value::String("string".into())
        }
        "integer" | "number" => Value::from(0),
        "boolean" => Value::from(true),
        "array" => Value::Array(vec![schema_to_example(schema.get("items"))]),
        "object" => {
            let mut obj = Map::new();
            if let Some(Value::Object(props)) = schema.get("properties") {
                for (k, v) in props {
                    obj.insert(k.clone(), schema_to_example(Some(v)));
                }
            }
            Value::Object(obj)
        }
        _ => Value::Null,
    }
}

fn is_semver(s: &str) -> bool {
    let parts: Vec<&str> = s.split('.').collect();
    parts.len() == 3
        && parts
            .iter()
            .all(|p| !p.is_empty() && p.chars().all(|c| c.is_ascii_digit()))
}

const VALID_METHODS: [&str; 8] = [
    "get", "put", "post", "delete", "options", "head", "patch", "trace",
];

fn validate_paths(paths: &Map<String, Value>) -> Vec<String> {
    let mut issues = Vec::new();
    let mut seen_op_ids: BTreeMap<String, String> = BTreeMap::new();

    for (path, methods_raw) in paths {
        if path.starts_with("x-") {
            continue;
        }
        if !path.starts_with('/') {
            issues.push(format!("path {path:?} should start with /"));
        }
        let Some(methods) = methods_raw.as_object() else {
            continue;
        };
        for (method, op_raw) in methods {
            if method.starts_with("x-") {
                continue;
            }
            if !VALID_METHODS.contains(&method.to_lowercase().as_str()) {
                issues.push(format!("path {path:?}: invalid method {method:?}"));
                continue;
            }
            let method_upper = method.to_uppercase();
            let Some(op) = op_raw.as_object() else {
                issues.push(format!(
                    "{method_upper} {path}: operation must be an object"
                ));
                continue;
            };
            let responses_empty = op
                .get("responses")
                .and_then(|r| r.as_object())
                .map(|r| r.is_empty())
                .unwrap_or(true);
            if responses_empty {
                issues.push(format!("{method_upper} {path}: missing responses"));
            }
            if let Some(op_id) = op.get("operationId").and_then(|v| v.as_str()) {
                if !op_id.is_empty() {
                    let where_ = format!("{method_upper} {path}");
                    if let Some(existing) = seen_op_ids.get(op_id) {
                        issues.push(format!(
                            "duplicate operationId {op_id:?} ({existing} and {where_})"
                        ));
                    } else {
                        seen_op_ids.insert(op_id.to_string(), where_);
                    }
                }
            }
        }
    }
    issues
}

fn validate_spec(spec: &Value) -> Vec<String> {
    let mut issues = Vec::new();
    let openapi_ver = spec.get("openapi").map(get_string).unwrap_or_default();
    if openapi_ver.is_empty() {
        issues.push("missing required field: openapi".to_string());
    } else if !is_semver(&openapi_ver) {
        issues.push(format!(
            "invalid openapi version: {openapi_ver:?} (expected semver)"
        ));
    }
    match spec.get("info").and_then(|i| i.as_object()) {
        None => issues.push("missing required object: info".to_string()),
        Some(info) => {
            if info
                .get("title")
                .map(get_string)
                .unwrap_or_default()
                .is_empty()
            {
                issues.push("info.title is required".to_string());
            }
            if info
                .get("version")
                .map(get_string)
                .unwrap_or_default()
                .is_empty()
            {
                issues.push("info.version is required".to_string());
            }
        }
    }
    match spec.get("paths").and_then(|p| p.as_object()) {
        None => issues.push("missing required object: paths".to_string()),
        Some(paths) => issues.extend(validate_paths(paths)),
    }
    issues
}

fn value_to_display(v: &Value) -> String {
    match v {
        Value::String(s) => s.clone(),
        Value::Number(n) => n.to_string(),
        Value::Bool(b) => b.to_string(),
        Value::Null => String::new(),
        other => serde_json::to_string(other).unwrap_or_default(),
    }
}

fn convert_to_postman(spec: &Value) -> Result<Value> {
    let mut info = Map::new();
    info.insert("name".into(), Value::from("Imported Collection"));
    info.insert("_postman_id".into(), Value::from("auto-generated"));
    info.insert("description".into(), Value::from(""));
    info.insert(
        "schema".into(),
        Value::from("https://schema.getpostman.com/json/collection/v2.1.0/collection.json"),
    );
    if let Some(i) = spec.get("info").and_then(|i| i.as_object()) {
        if let Some(t) = i.get("title").map(get_string).filter(|s| !s.is_empty()) {
            info.insert("name".into(), Value::from(t));
        }
        if let Some(d) = i
            .get("description")
            .map(get_string)
            .filter(|s| !s.is_empty())
        {
            info.insert("description".into(), Value::from(d));
        }
    }

    let mut base_url = String::new();
    if let Some(servers) = spec.get("servers").and_then(|s| s.as_array()) {
        if let Some(s) = servers.first().and_then(|s| s.as_object()) {
            base_url = s.get("url").map(get_string).unwrap_or_default();
        }
    }

    let paths = spec
        .get("paths")
        .and_then(|p| p.as_object())
        .ok_or_else(|| anyhow!("invalid paths (check YAML structure)"))?;

    let mut tag_map: BTreeMap<String, Vec<Value>> = BTreeMap::new();

    for (path, methods_raw) in paths {
        let Some(methods) = methods_raw.as_object() else {
            continue;
        };
        for (method, op_raw) in methods {
            let Some(op) = op_raw.as_object() else {
                continue;
            };
            let tag = op
                .get("tags")
                .and_then(|t| t.as_array())
                .and_then(|t| t.first())
                .map(get_string)
                .filter(|s| !s.is_empty())
                .unwrap_or_else(|| "default".to_string());

            let mut name = format!("{} {}", method.to_uppercase(), path);
            if let Some(s) = op.get("summary").map(get_string).filter(|s| !s.is_empty()) {
                name = s;
            }

            let mut query = Vec::new();
            let mut path_vars = Vec::new();
            let mut headers = Vec::new();

            if let Some(params) = op.get("parameters").and_then(|p| p.as_array()) {
                for p_raw in params {
                    let Some(p) = p_raw.as_object() else { continue };
                    let mut param = Map::new();
                    param.insert(
                        "key".into(),
                        Value::from(p.get("name").map(get_string).unwrap_or_default()),
                    );
                    param.insert("value".into(), Value::from(""));
                    param.insert(
                        "description".into(),
                        Value::from(p.get("description").map(get_string).unwrap_or_default()),
                    );
                    if let Some(ex) = p.get("example") {
                        param.insert("value".into(), Value::from(value_to_display(ex)));
                    }
                    match p.get("in").map(get_string).unwrap_or_default().as_str() {
                        "query" => query.push(Value::Object(param)),
                        "path" => path_vars.push(Value::Object(param)),
                        "header" => headers.push(Value::Object(param)),
                        _ => {}
                    }
                }
            }

            let mut body = Value::Null;
            if let Some(mt) = op
                .get("requestBody")
                .and_then(|r| r.get("content"))
                .and_then(|c| c.get("application/json"))
            {
                let mut ex = mt.get("example").cloned();
                if ex.is_none() {
                    if let Some(examples) = mt.get("examples").and_then(|e| e.as_object()) {
                        if let Some(v) = examples.values().next() {
                            ex = v.get("value").cloned();
                        }
                    }
                }
                if ex.is_none() {
                    ex = Some(schema_to_example(mt.get("schema")));
                }
                let raw = serde_json::to_string_pretty(&ex.unwrap_or(Value::Null))?;
                let mut body_opts = Map::new();
                let mut raw_opts = Map::new();
                raw_opts.insert("language".into(), Value::from("json"));
                body_opts.insert("raw".into(), Value::Object(raw_opts));
                let mut body_map = Map::new();
                body_map.insert("mode".into(), Value::from("raw"));
                body_map.insert("raw".into(), Value::from(raw));
                body_map.insert("options".into(), Value::Object(body_opts));
                body = Value::Object(body_map);
                let mut ct = Map::new();
                ct.insert("key".into(), Value::from("Content-Type"));
                ct.insert("value".into(), Value::from("application/json"));
                headers.push(Value::Object(ct));
            }

            let trimmed = path.trim_matches('/');
            let path_segments: Vec<Value> = if trimmed.is_empty() {
                vec![Value::from("")]
            } else {
                trimmed.split('/').map(Value::from).collect()
            };

            let mut url_map = Map::new();
            url_map.insert("raw".into(), Value::from(format!("{base_url}{path}")));
            url_map.insert("path".into(), Value::Array(path_segments));
            url_map.insert("query".into(), Value::Array(query));
            url_map.insert("variable".into(), Value::Array(path_vars));

            let mut req = Map::new();
            req.insert("method".into(), Value::from(method.to_uppercase()));
            req.insert("header".into(), Value::Array(headers));
            req.insert("url".into(), Value::Object(url_map));
            req.insert(
                "description".into(),
                Value::from(op.get("description").map(get_string).unwrap_or_default()),
            );
            if !body.is_null() {
                req.insert("body".into(), body);
            }

            let mut item = Map::new();
            item.insert("name".into(), Value::from(name));
            item.insert("request".into(), Value::Object(req));
            item.insert("response".into(), Value::Array(vec![]));
            tag_map.entry(tag).or_default().push(Value::Object(item));
        }
    }

    let folders: Vec<Value> = tag_map
        .into_iter()
        .map(|(tag, items)| {
            let mut f = Map::new();
            f.insert("name".into(), Value::from(tag));
            f.insert("item".into(), Value::Array(items));
            Value::Object(f)
        })
        .collect();

    let mut out = Map::new();
    out.insert("info".into(), Value::Object(info));
    out.insert("item".into(), Value::Array(folders));
    out.insert(
        "variable".into(),
        Value::Array(vec![{
            let mut v = Map::new();
            v.insert("key".into(), Value::from("baseUrl"));
            v.insert("value".into(), Value::from(base_url));
            v.insert("type".into(), Value::from("string"));
            Value::Object(v)
        }]),
    );
    Ok(Value::Object(out))
}

fn run_validate(args: &ValidateArgs, json: bool) -> Result<()> {
    let data = std::fs::read(&args.file)?;
    let spec = parse_openapi(&data).map_err(|e| anyhow!("parse error: {e}"))?;
    let issues = validate_spec(&spec);
    if issues.is_empty() {
        if json {
            println!(
                "{}",
                serde_json::to_string(
                    &serde_json::json!({"valid": true, "message": "valid openapi spec"})
                )?
            );
        } else {
            println!("valid openapi spec");
        }
        return Ok(());
    }
    if json {
        println!(
            "{}",
            serde_json::to_string(&serde_json::json!({
                "valid": false,
                "issues": issues,
                "count": issues.len(),
            }))?
        );
    } else {
        for issue in &issues {
            eprintln!("{issue}");
        }
    }
    Err(anyhow!("{} validation issue(s) found", issues.len()))
}

fn run_postman(args: &PostmanArgs) -> Result<()> {
    if args.input.is_empty() {
        return Err(anyhow!("input file required (-i)"));
    }
    let data = std::fs::read(&args.input)?;
    let spec = parse_openapi(&data)?;
    let postman = convert_to_postman(&spec)?;
    let out = serde_json::to_string_pretty(&postman)?;
    if args.output.is_empty() {
        println!("{out}");
    } else {
        std::fs::write(&args.output, out)?;
    }
    Ok(())
}

pub fn run(args: &OpenapiArgs) -> Result<()> {
    let Some(command) = &args.command else {
        let mut cmd = <OpenapiArgs as ClapArgs>::augment_args(clap::Command::new("openapi"));
        let _ = cmd.print_help();
        return Ok(());
    };
    match command {
        OpenapiCommand::Validate(a) => run_validate(a, args.json),
        OpenapiCommand::Openapi2postman(a) => run_postman(a),
    }
}
