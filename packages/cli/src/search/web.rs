use anyhow::{anyhow, Result};
use clap::Args;
use scraper::{Html, Selector};
use serde::Serialize;

#[derive(Args)]
pub struct WebArgs {
    /// Search query
    #[arg(long, short = 'q', default_value = "")]
    pub query: String,
    /// Maximum number of results
    #[arg(long, short = 'n', default_value_t = 5)]
    pub max_results: usize,
    /// Search source (duckduckgo)
    #[arg(long, short = 's', default_value = "duckduckgo")]
    pub source: String,
}

#[derive(Serialize)]
struct WebResult {
    title: String,
    url: String,
    snippet: String,
}

pub fn run(args: &WebArgs, json: bool) -> Result<()> {
    if !args.source.is_empty() && args.source != "duckduckgo" {
        return Err(anyhow!(
            "unsupported search source: {} (use 'duckduckgo')",
            args.source
        ));
    }
    duckduckgo_search(&args.query, args.max_results, json)
}

fn duckduckgo_search(query: &str, max_results: usize, json: bool) -> Result<()> {
    let search_url = format!("https://lite.duckduckgo.com/lite/?q={}", url_encode(query));
    let body = crate::requests::get_string(&search_url).map_err(|e| anyhow!("fetch error: {e}"))?;
    let results = parse_ddg(&body, max_results);
    output_results(&results, query, json)
}

fn url_encode(s: &str) -> String {
    let mut out = String::new();
    for b in s.bytes() {
        match b {
            b'A'..=b'Z' | b'a'..=b'z' | b'0'..=b'9' | b'-' | b'_' | b'.' | b'~' => {
                out.push(b as char)
            }
            _ => out.push_str(&format!("%{b:02X}")),
        }
    }
    out
}

fn parse_ddg(html_str: &str, max_results: usize) -> Vec<WebResult> {
    let doc = Html::parse_document(html_str);
    let link_sel = Selector::parse("a.result-link").unwrap();
    let snip_sel = Selector::parse("td.result-snippet").unwrap();

    let mut results: Vec<WebResult> = Vec::new();
    for el in doc.select(&link_sel) {
        let title = el.text().collect::<String>().trim().to_string();
        let mut url = el.value().attr("href").unwrap_or("").to_string();
        if title.is_empty() {
            continue;
        }
        if !url.starts_with("http") {
            if let Some(rest) = url.strip_prefix("//") {
                url = format!("https://{rest}");
            } else {
                url = format!("https://{url}");
            }
        }
        results.push(WebResult {
            title,
            url,
            snippet: String::new(),
        });
    }
    // Snippets: Go pairs each result-snippet td with the last result.
    for el in doc.select(&snip_sel) {
        let snippet = el.text().collect::<String>().trim().to_string();
        if let Some(last) = results.last_mut() {
            last.snippet = snippet;
        }
    }
    if max_results > 0 && results.len() > max_results {
        results.truncate(max_results);
    }
    results
}

fn output_results(results: &[WebResult], query: &str, json: bool) -> Result<()> {
    if json {
        println!(
            "{}",
            serde_json::to_string_pretty(&serde_json::json!({
                "query": query,
                "results": results,
                "count": results.len(),
            }))?
        );
        return Ok(());
    }
    if results.is_empty() {
        println!("(no results)");
        return Ok(());
    }
    for (i, r) in results.iter().enumerate() {
        println!("{}. {}", i + 1, r.title);
        println!("   {}", r.url);
        if !r.snippet.is_empty() {
            println!("   {}", r.snippet);
        }
        println!();
    }
    println!("{} results from DuckDuckGo", results.len());
    Ok(())
}
