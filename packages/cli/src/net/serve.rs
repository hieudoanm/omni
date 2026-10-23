use anyhow::{anyhow, Context, Result};
use clap::Args;
use std::io::{Read, Write};
use std::net::TcpListener;
use std::path::{Component, Path, PathBuf};

#[derive(Args)]
pub struct ServeArgs {
    /// Port to listen on
    #[arg(long, short = 'p', default_value_t = 8080)]
    pub port: u16,
    /// Directory to serve
    #[arg(long, short = 'd', default_value = ".")]
    pub dir: String,
    /// Enable CORS headers
    #[arg(long)]
    pub cors: bool,
    /// TLS certificate file
    #[arg(long, default_value = "")]
    pub cert: String,
    /// TLS key file
    #[arg(long, default_value = "")]
    pub key: String,
    /// Output in JSON format
    #[arg(long)]
    pub json: bool,
}

fn content_type(path: &Path) -> &'static str {
    match path.extension().and_then(|e| e.to_str()).unwrap_or("") {
        "html" | "htm" => "text/html; charset=utf-8",
        "css" => "text/css; charset=utf-8",
        "js" | "mjs" => "application/javascript; charset=utf-8",
        "json" => "application/json",
        "png" => "image/png",
        "jpg" | "jpeg" => "image/jpeg",
        "gif" => "image/gif",
        "svg" => "image/svg+xml",
        "webp" => "image/webp",
        "ico" => "image/x-icon",
        "txt" => "text/plain; charset=utf-8",
        "md" => "text/markdown; charset=utf-8",
        "pdf" => "application/pdf",
        "zip" => "application/zip",
        "gz" | "tgz" => "application/gzip",
        "tar" => "application/x-tar",
        "mp3" => "audio/mpeg",
        "mp4" => "video/mp4",
        "webm" => "video/webm",
        "wasm" => "application/wasm",
        "xml" => "application/xml",
        "csv" => "text/csv",
        "woff" => "font/woff",
        "woff2" => "font/woff2",
        "ttf" => "font/ttf",
        "otf" => "font/otf",
        _ => "application/octet-stream",
    }
}

fn percent_decode(s: &str) -> String {
    let bytes = s.as_bytes();
    let mut out = Vec::with_capacity(bytes.len());
    let mut i = 0;
    while i < bytes.len() {
        if bytes[i] == b'%' && i + 2 < bytes.len() {
            if let Ok(v) = u8::from_str_radix(&s[i + 1..i + 3], 16) {
                out.push(v);
                i += 3;
                continue;
            }
        }
        out.push(if bytes[i] == b'+' { b' ' } else { bytes[i] });
        i += 1;
    }
    String::from_utf8_lossy(&out).into_owned()
}

/// Resolve a request path under root, rejecting traversal.
fn resolve(root: &Path, url_path: &str) -> Option<PathBuf> {
    let decoded = percent_decode(url_path.split('?').next().unwrap_or("/"));
    let rel = decoded.trim_start_matches('/');
    let mut out = root.to_path_buf();
    for comp in Path::new(rel).components() {
        match comp {
            Component::Normal(c) => out.push(c),
            Component::CurDir => {}
            _ => return None,
        }
    }
    if !out.starts_with(root) {
        return None;
    }
    Some(out)
}

fn dir_listing(dir: &Path, url_path: &str) -> Vec<u8> {
    let mut entries: Vec<(String, bool)> = Vec::new();
    if let Ok(rd) = std::fs::read_dir(dir) {
        for e in rd.flatten() {
            let name = e.file_name().to_string_lossy().into_owned();
            let is_dir = e.file_type().map(|t| t.is_dir()).unwrap_or(false);
            entries.push((name, is_dir));
        }
    }
    entries.sort_by(|a, b| b.1.cmp(&a.1).then(a.0.cmp(&b.0)));

    let mut html =
        String::from("<!doctype html><html><head><meta charset=\"utf-8\"><title>Index of ");
    html.push_str(url_path);
    html.push_str("</title></head><body><h1>Index of ");
    html.push_str(url_path);
    html.push_str("</h1><hr><pre>");
    if url_path != "/" {
        html.push_str("<a href=\"..\">../</a>\n");
    }
    for (name, is_dir) in entries {
        let display = if is_dir {
            format!("{name}/")
        } else {
            name.clone()
        };
        html.push_str(&format!("<a href=\"{name}\">{display}</a>\n"));
    }
    html.push_str("</pre><hr></body></html>");
    html.into_bytes()
}

fn send_response<S: Write>(
    stream: &mut S,
    status: &str,
    content_type: &str,
    body: &[u8],
    cors: bool,
) -> Result<()> {
    let head = format!(
        "HTTP/1.1 {status}\r\nContent-Type: {content_type}\r\nContent-Length: {}\r\nConnection: close\r\n{}\r\n",
        body.len(),
        if cors {
            "Access-Control-Allow-Origin: *\r\nAccess-Control-Allow-Methods: GET, OPTIONS\r\nAccess-Control-Allow-Headers: *\r\n"
        } else {
            ""
        }
    );
    stream.write_all(head.as_bytes())?;
    stream.write_all(body)?;
    stream.flush()?;
    Ok(())
}

fn handle_conn<S: Read + Write>(mut stream: S, root: &Path, cors: bool) {
    let mut buf = Vec::with_capacity(8192);
    let mut tmp = [0u8; 8192];
    // Read until end of headers.
    loop {
        match stream.read(&mut tmp) {
            Ok(0) => return,
            Ok(n) => {
                buf.extend_from_slice(&tmp[..n]);
                if buf.windows(4).any(|w| w == b"\r\n\r\n") || buf.len() > 65536 {
                    break;
                }
            }
            Err(_) => return,
        }
    }
    let req = String::from_utf8_lossy(&buf);
    let mut parts = req.split_whitespace();
    let method = parts.next().unwrap_or("");
    let path = parts.next().unwrap_or("/");

    if cors && method == "OPTIONS" {
        let _ = send_response(&mut stream, "204 No Content", "text/plain", &[], true);
        return;
    }
    if method != "GET" && method != "HEAD" {
        let _ = send_response(
            &mut stream,
            "405 Method Not Allowed",
            "text/plain",
            b"method not allowed",
            cors,
        );
        return;
    }

    let Some(fs_path) = resolve(root, path) else {
        let _ = send_response(
            &mut stream,
            "403 Forbidden",
            "text/plain",
            b"forbidden",
            cors,
        );
        return;
    };

    let mut file_path = fs_path.clone();
    if file_path.is_dir() {
        let index = file_path.join("index.html");
        if index.is_file() {
            file_path = index;
        } else {
            let body = dir_listing(&fs_path, path);
            let _ = send_response(
                &mut stream,
                "200 OK",
                "text/html; charset=utf-8",
                &body,
                cors,
            );
            return;
        }
    }

    match std::fs::read(&file_path) {
        Ok(body) => {
            let _ = send_response(&mut stream, "200 OK", content_type(&file_path), &body, cors);
        }
        Err(_) => {
            let _ = send_response(
                &mut stream,
                "404 Not Found",
                "text/plain",
                b"not found",
                cors,
            );
        }
    }
}

pub fn run(args: &ServeArgs) -> Result<()> {
    let abs_dir = std::fs::canonicalize(&args.dir)
        .with_context(|| format!("directory error: {}", args.dir))?;
    if !abs_dir.is_dir() {
        return Err(anyhow!("{} is not a directory", abs_dir.display()));
    }

    // Probe the port like Go does.
    if TcpListener::bind(("0.0.0.0", args.port)).is_err() {
        return Err(anyhow!("port {} unavailable", args.port));
    }

    let tls = !args.cert.is_empty() && !args.key.is_empty();
    if args.json {
        println!(
            "{}",
            serde_json::to_string_pretty(&serde_json::json!({
                "directory": abs_dir,
                "url": format!("http://localhost:{}", args.port),
                "port": args.port,
                "tls": tls,
            }))?
        );
    } else {
        println!(
            "Serving {} on http://localhost:{}",
            abs_dir.display(),
            args.port
        );
        if tls {
            println!("TLS enabled (cert: {}, key: {})", args.cert, args.key);
        }
    }

    let listener = TcpListener::bind(("0.0.0.0", args.port))
        .with_context(|| format!("port {} unavailable", args.port))?;

    if tls {
        serve_tls(listener, &abs_dir, args)?;
    } else {
        for conn in listener.incoming() {
            match conn {
                Ok(stream) => {
                    let root = abs_dir.clone();
                    let cors = args.cors;
                    std::thread::spawn(move || handle_conn(stream, &root, cors));
                }
                Err(_) => continue,
            }
        }
    }
    Ok(())
}

fn serve_tls(listener: TcpListener, root: &Path, args: &ServeArgs) -> Result<()> {
    use rustls::pki_types::CertificateDer;
    use rustls::ServerConfig;

    let cert_pem = std::fs::read(&args.cert).context("read cert file")?;
    let key_pem = std::fs::read(&args.key).context("read key file")?;
    let certs: Vec<CertificateDer<'static>> = rustls_pemfile::certs(&mut cert_pem.as_slice())
        .collect::<Result<_, _>>()
        .context("parse cert PEM")?;
    let key = rustls_pemfile::private_key(&mut key_pem.as_slice())
        .context("parse key PEM")?
        .context("no private key found")?;

    let config = ServerConfig::builder()
        .with_no_client_auth()
        .with_single_cert(certs, key)
        .context("TLS config")?;
    let config = std::sync::Arc::new(config);

    for conn in listener.incoming() {
        match conn {
            Ok(stream) => {
                let root = root.to_path_buf();
                let cors = args.cors;
                let config = config.clone();
                std::thread::spawn(move || {
                    if let Ok(conn) = rustls::ServerConnection::new(config) {
                        let tls = rustls::StreamOwned::new(conn, stream);
                        handle_conn(tls, &root, cors);
                    }
                });
            }
            Err(_) => continue,
        }
    }
    Ok(())
}
