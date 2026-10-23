use super::lib;
use anyhow::{anyhow, Result};
use clap::Args;
use serde_json::json;
use std::io::{Read, Write};
use std::net::TcpListener;

#[derive(Args)]
pub struct ServeArgs {
    /// Port to listen on
    #[arg(long, short = 'p', default_value = "8080")]
    pub port: String,
}

#[allow(dead_code)]
fn chat_response(prompt: &str, model: &str) -> serde_json::Value {
    match lib::generate(model, prompt) {
        Ok(output) => json!({"prompt": prompt, "response": output}),
        Err(e) => {
            // handled by caller via status
            json!({"error": e.to_string()})
        }
    }
}

pub fn run(args: &ServeArgs) -> Result<()> {
    let addr = format!("0.0.0.0:{}", args.port);
    let listener = TcpListener::bind(&addr).map_err(|e| anyhow!("listen {addr}: {e}"))?;
    println!(
        "OpenRouter server listening on http://localhost:{}",
        args.port
    );
    println!("  GET  / -> health check");
    println!("  POST /chat -> {{\"prompt\":\"...\",\"model\":\"...\"}}");

    for stream in listener.incoming() {
        let mut stream = match stream {
            Ok(s) => s,
            Err(_) => continue,
        };
        let mut buf = Vec::new();
        let mut tmp = [0u8; 8192];
        // read headers + body (simple: read until \r\n\r\n then content-length)
        let mut header_end = None;
        let mut content_length = 0usize;
        loop {
            match stream.read(&mut tmp) {
                Ok(0) => break,
                Ok(n) => {
                    buf.extend_from_slice(&tmp[..n]);
                    if header_end.is_none() {
                        if let Some(pos) = find_subslice(&buf, b"\r\n\r\n") {
                            header_end = Some(pos + 4);
                            let headers = String::from_utf8_lossy(&buf[..pos]);
                            for line in headers.lines() {
                                if line.to_lowercase().starts_with("content-length:") {
                                    content_length = line[15..].trim().parse().unwrap_or(0);
                                }
                            }
                        }
                    }
                    if let Some(he) = header_end {
                        if buf.len() >= he + content_length {
                            break;
                        }
                    }
                }
                Err(_) => break,
            }
        }
        if buf.is_empty() {
            continue;
        }
        let request = String::from_utf8_lossy(&buf).to_string();
        let first_line = request.lines().next().unwrap_or("");
        let mut parts = first_line.split_whitespace();
        let method = parts.next().unwrap_or("");
        let path = parts.next().unwrap_or("/");

        let (status, body): (u16, String) = if path == "/" && method == "GET" {
            (
                200,
                serde_json::to_string(&json!({
                    "message": "Go + OpenRouter Chat API server is running"
                }))
                .unwrap(),
            )
        } else if path == "/chat" && method == "POST" {
            let he = header_end.unwrap_or(0);
            let body_bytes = &buf[he..];
            let parsed: Result<serde_json::Value, _> = serde_json::from_slice(body_bytes);
            match parsed {
                Ok(req) => {
                    let prompt = req["prompt"].as_str().unwrap_or("").to_string();
                    let model = req["model"]
                        .as_str()
                        .filter(|m| !m.is_empty())
                        .unwrap_or("openai/gpt-oss-20b")
                        .to_string();
                    match lib::generate(&model, &prompt) {
                        Ok(output) => (
                            200,
                            serde_json::to_string(&json!({"prompt": prompt, "response": output}))
                                .unwrap(),
                        ),
                        Err(e) => (
                            500,
                            serde_json::to_string(&json!({"error": e.to_string()})).unwrap(),
                        ),
                    }
                }
                Err(_) => (
                    400,
                    serde_json::to_string(&json!({"error": "invalid request body"})).unwrap(),
                ),
            }
        } else {
            (
                404,
                serde_json::to_string(&json!({"error": "not found"})).unwrap(),
            )
        };

        let reason = match status {
            200 => "OK",
            400 => "Bad Request",
            404 => "Not Found",
            405 => "Method Not Allowed",
            _ => "Internal Server Error",
        };
        let response = format!(
            "HTTP/1.1 {status} {reason}\r\nContent-Type: application/json\r\nContent-Length: {}\r\nConnection: close\r\n\r\n{body}",
            body.len()
        );
        let _ = stream.write_all(response.as_bytes());
    }
    Ok(())
}

fn find_subslice(haystack: &[u8], needle: &[u8]) -> Option<usize> {
    haystack.windows(needle.len()).position(|w| w == needle)
}
