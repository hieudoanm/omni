//! `openrouter hook` — Telegram webhook → OpenRouter → reply, exposed via ngrok.
use anyhow::{anyhow, Result};
use clap::Args;
use serde::Deserialize;
use std::io::{BufRead, BufReader, Read, Write};
use std::net::TcpListener;
use std::process::{Command, Stdio};
use std::sync::mpsc;
use std::thread;
use std::time::Duration;

#[derive(Args)]
pub struct HookArgs {}

#[derive(Deserialize)]
struct TelegramUpdate {
    #[serde(rename = "update_id")]
    update_id: i64,
    message: Option<TelegramMessage>,
}

#[derive(Deserialize)]
struct TelegramMessage {
    #[serde(rename = "message_id")]
    #[allow(dead_code)]
    message_id: i64,
    text: Option<String>,
    chat: TelegramChat,
}

#[derive(Deserialize)]
struct TelegramChat {
    id: i64,
}

const TELEGRAM_MAX_LENGTH: usize = 4096;

fn agent() -> ureq::Agent {
    ureq::Agent::config_builder()
        .timeout_global(Some(Duration::from_secs(60)))
        .build()
        .new_agent()
}

fn query_open_router(text: &str) -> Result<String> {
    let api_key = std::env::var("OPEN_ROUTER_API_KEY")
        .map_err(|_| anyhow!("OPEN_ROUTER_API_KEY is not set"))?;
    let payload = serde_json::json!({
        "model": "openrouter/free",
        "messages": [{"role": "user", "content": text}],
    });
    let mut resp = agent()
        .post("https://openrouter.ai/api/v1/chat/completions")
        .header("Content-Type", "application/json")
        .header("Authorization", &format!("Bearer {api_key}"))
        .send_json(payload)
        .map_err(|e| anyhow!("failed to call OpenRouter: {e}"))?;
    let status = resp.status().as_u16();
    let body = resp.body_mut().read_to_string().unwrap_or_default();
    if status != 200 {
        return Err(anyhow!("OpenRouter API error {status}: {body}"));
    }
    let result: serde_json::Value = serde_json::from_str(&body)?;
    if let Some(err) = result.pointer("/error/message").and_then(|m| m.as_str()) {
        return Err(anyhow!("OpenRouter error: {err}"));
    }
    result
        .pointer("/choices/0/message/content")
        .and_then(|c| c.as_str())
        .map(|s| s.trim().to_string())
        .ok_or_else(|| anyhow!("no choices returned from OpenRouter"))
}

fn chunk_text(text: &str, max_len: usize) -> Vec<String> {
    if text.len() <= max_len {
        return vec![text.to_string()];
    }
    let mut chunks = Vec::new();
    let mut current = String::new();
    for line in text.split('\n') {
        if line.len() > max_len {
            if !current.is_empty() {
                chunks.push(current.trim().to_string());
                current.clear();
            }
            let mut rest = line;
            while rest.len() > max_len {
                let mut end = max_len;
                while !rest.is_char_boundary(end) {
                    end -= 1;
                }
                chunks.push(rest[..end].to_string());
                rest = &rest[end..];
            }
            current.push_str(rest);
            current.push('\n');
            continue;
        }
        if current.len() + line.len() + 1 > max_len {
            chunks.push(current.trim().to_string());
            current.clear();
        }
        current.push_str(line);
        current.push('\n');
    }
    if !current.is_empty() {
        chunks.push(current.trim().to_string());
    }
    chunks
}

fn send_chunk(token: &str, chat_id: i64, text: &str) -> Result<()> {
    let api_url = format!("https://api.telegram.org/bot{token}/sendMessage");
    let payload = serde_json::json!({
        "chat_id": chat_id, "text": text, "parse_mode": "Markdown",
    });
    let mut resp = agent()
        .post(&api_url)
        .header("Content-Type", "application/json")
        .send_json(payload.clone())
        .map_err(|e| anyhow!("failed to post message: {e}"))?;
    let status = resp.status().as_u16();
    if status != 200 {
        let body = resp.body_mut().read_to_string().unwrap_or_default();
        if status == 400 && body.contains("can't parse entities") {
            println!("Markdown parse failed, retrying as plain text...");
            let plain = serde_json::json!({"chat_id": chat_id, "text": text});
            let mut r2 = agent()
                .post(&api_url)
                .header("Content-Type", "application/json")
                .send_json(plain)
                .map_err(|e| anyhow!("failed to post plain message: {e}"))?;
            if r2.status().as_u16() != 200 {
                let b = r2.body_mut().read_to_string().unwrap_or_default();
                return Err(anyhow!("telegram API error {}: {b}", r2.status()));
            }
            return Ok(());
        }
        return Err(anyhow!("telegram API error {status}: {body}"));
    }
    Ok(())
}

fn send_telegram_message(chat_id: i64, text: &str) -> Result<()> {
    let token = std::env::var("TELEGRAM_API_TOKEN")
        .map_err(|_| anyhow!("TELEGRAM_API_TOKEN is not set"))?;
    let chunks = chunk_text(text, TELEGRAM_MAX_LENGTH);
    println!("Sending {} chunk(s) to chat {chat_id}", chunks.len());
    for (i, chunk) in chunks.iter().enumerate() {
        send_chunk(&token, chat_id, chunk)
            .map_err(|e| anyhow!("failed to send chunk {}/{}: {e}", i + 1, chunks.len()))?;
        if i + 1 < chunks.len() {
            thread::sleep(Duration::from_millis(300));
        }
    }
    println!("Message sent to chat {chat_id} ({} chunk(s))", chunks.len());
    Ok(())
}

fn set_telegram_webhook(public_url: &str) -> Result<()> {
    let token = std::env::var("TELEGRAM_API_TOKEN")
        .map_err(|_| anyhow!("TELEGRAM_API_TOKEN is not set"))?;
    let webhook_url = format!("{public_url}/webhook");
    let api_url = format!("https://api.telegram.org/bot{token}/setWebhook");
    let mut resp = agent()
        .post(&api_url)
        .header("Content-Type", "application/json")
        .send_json(serde_json::json!({"url": webhook_url}))
        .map_err(|e| anyhow!("failed to call setWebhook: {e}"))?;
    if resp.status().as_u16() != 200 {
        let body = resp.body_mut().read_to_string().unwrap_or_default();
        return Err(anyhow!("telegram API error {}: {body}", resp.status()));
    }
    println!("Telegram webhook set to: {webhook_url}");
    Ok(())
}

fn wait_for_tunnel(public_url: &str) {
    let health = format!("{public_url}/health");
    let short_agent = ureq::Agent::config_builder()
        .timeout_global(Some(Duration::from_secs(5)))
        .build()
        .new_agent();
    println!("Waiting for tunnel to become reachable...");
    loop {
        let ok = short_agent
            .get(&health)
            .call()
            .map(|r| r.status().as_u16() == 200)
            .unwrap_or(false);
        if ok {
            println!("Tunnel is live!");
            return;
        }
        println!("   not ready yet, retrying in 5s...");
        thread::sleep(Duration::from_secs(5));
    }
}

fn set_webhook_with_retry(public_url: &str) {
    let public_url = public_url.trim().to_string();
    println!("Webhook URL: {public_url:?}");
    wait_for_tunnel(&public_url);
    for i in 1..=10 {
        println!("Registering Telegram webhook ({i}/10)...");
        match set_telegram_webhook(&public_url) {
            Ok(()) => return,
            Err(e) => {
                eprintln!("Attempt {i} failed: {e}");
                thread::sleep(Duration::from_secs(5));
            }
        }
    }
    eprintln!("Failed to set Telegram webhook after 10 attempts");
}

fn start_ngrok() {
    thread::sleep(Duration::from_secs(1));
    println!("Starting ngrok tunnel...");
    let mut child = match Command::new("ngrok")
        .args(["http", "8080", "--log", "stdout", "--log-format", "json"])
        .stdout(Stdio::piped())
        .stderr(Stdio::inherit())
        .spawn()
    {
        Ok(c) => c,
        Err(e) => {
            eprintln!("Failed to start ngrok: {e}");
            eprintln!("Install it with: brew install ngrok");
            return;
        }
    };
    let stdout = child.stdout.take().unwrap();
    let (tx, rx) = mpsc::channel::<String>();
    thread::spawn(move || {
        for l in BufReader::new(stdout).lines().map_while(Result::ok) {
            let _ = tx.send(l);
        }
    });
    // scan logs for tunnel URL
    let deadline = std::time::Instant::now() + Duration::from_secs(45);
    let mut url = None;
    while std::time::Instant::now() < deadline {
        match rx.recv_timeout(Duration::from_millis(500)) {
            Ok(line) => {
                if let Ok(v) = serde_json::from_str::<serde_json::Value>(&line) {
                    if let Some(u) = v.get("url").and_then(|u| u.as_str()) {
                        if u.starts_with("https://") {
                            println!("\nngrok tunnel URL : {u}\n");
                            url = Some(u.to_string());
                            break;
                        }
                    }
                }
            }
            Err(mpsc::RecvTimeoutError::Timeout) => {}
            Err(mpsc::RecvTimeoutError::Disconnected) => break,
        }
    }
    drop(rx);
    // also poll ngrok API
    let public = url.or_else(fetch_ngrok_api_url);
    if let Some(u) = public {
        println!("\nPublic HTTPS URL : {u}\n");
        let _ = thread::Builder::new().spawn(move || set_webhook_with_retry(&u));
    } else {
        eprintln!("Could not retrieve ngrok tunnel URL after 40s");
    }
    let _ = child.wait();
}

fn fetch_ngrok_api_url() -> Option<String> {
    println!("Waiting for ngrok API...");
    for _ in 0..20 {
        thread::sleep(Duration::from_secs(2));
        let short_agent = ureq::Agent::config_builder()
            .timeout_global(Some(Duration::from_secs(3)))
            .build()
            .new_agent();
        if let Ok(mut resp) = short_agent.get("http://localhost:4040/api/tunnels").call() {
            let body = resp.body_mut().read_to_string().unwrap_or_default();
            if let Ok(v) = serde_json::from_str::<serde_json::Value>(&body) {
                if let Some(tunnels) = v.get("tunnels").and_then(|t| t.as_array()) {
                    for t in tunnels {
                        if t.get("proto").and_then(|p| p.as_str()) == Some("https") {
                            if let Some(u) = t.get("public_url").and_then(|u| u.as_str()) {
                                if u.starts_with("https://") {
                                    return Some(u.to_string());
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    None
}

fn handle_message(chat_id: i64, text: &str) -> Result<()> {
    println!("Processing message with LLM: {text:?}");
    let reply = query_open_router(text)?;
    println!("LLM reply: {reply:?}");
    send_telegram_message(chat_id, &reply)
}

fn read_request(stream: &mut std::net::TcpStream) -> Option<(String, String, Vec<u8>)> {
    let mut buf = Vec::new();
    let mut tmp = [0u8; 8192];
    let mut header_end = None;
    let mut content_length = 0usize;
    loop {
        match stream.read(&mut tmp) {
            Ok(0) => break,
            Ok(n) => {
                buf.extend_from_slice(&tmp[..n]);
                if header_end.is_none() {
                    if let Some(pos) = buf.windows(4).position(|w| w == b"\r\n\r\n") {
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
        return None;
    }
    let he = header_end.unwrap_or(buf.len());
    let head = String::from_utf8_lossy(&buf[..he.min(buf.len())]).to_string();
    let first = head.lines().next().unwrap_or("").to_string();
    let body = buf[he.min(buf.len())..].to_vec();
    Some((first, head, body))
}

fn respond(stream: &mut std::net::TcpStream, status: u16, reason: &str, body: &str) {
    let resp = format!(
        "HTTP/1.1 {status} {reason}\r\nContent-Type: application/json\r\nContent-Length: {}\r\nConnection: close\r\n\r\n{body}",
        body.len()
    );
    let _ = stream.write_all(resp.as_bytes());
}

fn start_webhook() -> Result<()> {
    let listener = TcpListener::bind("127.0.0.1:8080")
        .or_else(|_| TcpListener::bind("0.0.0.0:8080"))
        .map_err(|e| anyhow!("listen :8080: {e}"))?;
    println!("Webhook server listening on http://localhost:8080/webhook");
    println!("Health check available at http://localhost:8080/health");
    println!();
    for stream in listener.incoming() {
        let mut stream = match stream {
            Ok(s) => s,
            Err(_) => continue,
        };
        let Some((first_line, _head, body)) = read_request(&mut stream) else {
            continue;
        };
        let mut parts = first_line.split_whitespace();
        let method = parts.next().unwrap_or("");
        let path = parts.next().unwrap_or("/");
        let addr = stream
            .peer_addr()
            .map(|a| a.to_string())
            .unwrap_or_default();
        if path == "/webhook" {
            if method != "POST" {
                respond(&mut stream, 405, "Method Not Allowed", "Method not allowed");
                continue;
            }
            println!(
                "[{}] Webhook received from {addr}",
                chrono::Local::now().to_rfc3339()
            );
            let text = String::from_utf8_lossy(&body).to_string();
            println!("Raw body: {text}");
            match serde_json::from_str::<TelegramUpdate>(&text) {
                Ok(update) => {
                    println!("Parsed update_id={}", update.update_id);
                    if let Some(msg) = &update.message {
                        println!(
                            "Message: chat_id={} text={:?}",
                            msg.chat.id,
                            msg.text.as_deref().unwrap_or("")
                        );
                        if let Some(t) = &msg.text {
                            if let Err(e) = handle_message(msg.chat.id, t) {
                                eprintln!("Failed to handle message: {e}");
                            }
                        }
                    } else {
                        println!("update.Message is nil - non-text update (sticker, photo, etc.)");
                    }
                }
                Err(e) => eprintln!("Failed to parse update: {e}"),
            }
            respond(&mut stream, 200, "OK", "{\"ok\":true}");
        } else if path == "/health" {
            respond(&mut stream, 200, "OK", "{\"status\":\"healthy\"}");
        } else {
            respond(&mut stream, 404, "Not Found", "{}");
        }
    }
    Ok(())
}

pub fn run() -> Result<()> {
    println!("Starting hook mode...");
    println!();
    thread::Builder::new()
        .name("ngrok".into())
        .spawn(start_ngrok)
        .map_err(|e| anyhow!("spawn ngrok: {e}"))?;
    start_webhook()
}
