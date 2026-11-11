use anyhow::{anyhow, Result};
use clap::Args;

#[derive(Args)]
pub struct HttpArgs {
    /// URL to request
    #[arg(long, short = 'u', default_value = "")]
    pub url: String,
    /// HTTP method (GET, POST, PUT, DELETE)
    #[arg(long, short = 'X', default_value = "GET")]
    pub method: String,
    /// Request body data
    #[arg(long, short = 'd', default_value = "")]
    pub data: String,
    /// Request headers (key:val,key2:val2)
    #[arg(long, short = 'H', default_value = "")]
    pub header: String,
    /// Pretty-print JSON response
    #[arg(long)]
    pub json: bool,
}

pub fn run(args: &HttpArgs) -> Result<()> {
    let method = args.method.to_uppercase();
    let method = if method.is_empty() {
        "GET"
    } else {
        method.as_str()
    };

    let body = if args.data.is_empty() {
        None
    } else {
        Some(args.data.as_bytes())
    };

    let mut headers: Vec<(String, String)> = Vec::new();
    if !args.header.is_empty() {
        for h in args.header.split(',') {
            let h = h.trim();
            if let Some((k, v)) = h.split_once(':') {
                headers.push((k.trim().to_string(), v.trim().to_string()));
            }
        }
    }

    let resp = crate::requests::request(method, &args.url, body, &headers)
        .map_err(|e| anyhow!("request failed: {e}"))?;

    if args.json {
        if let Ok(v) = serde_json::from_slice::<serde_json::Value>(&resp) {
            println!("{}", serde_json::to_string_pretty(&v)?);
            return Ok(());
        }
    }
    println!("{}", String::from_utf8_lossy(&resp));
    Ok(())
}
