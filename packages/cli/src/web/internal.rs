//! Shared helpers for the web module.
use anyhow::{anyhow, Result};
use scraper::{Html, Selector};

/// Fetch a page with a plain HTTP GET (30s timeout, TableParser UA).
pub fn fetch_page(url: &str) -> Result<String> {
    let agent = ureq::Agent::config_builder()
        .timeout_global(Some(std::time::Duration::from_secs(30)))
        .build()
        .new_agent();
    let body = agent
        .get(url)
        .header("User-Agent", "Mozilla/5.0 (compatible; TableParser/1.0)")
        .call()
        .map_err(|e| anyhow!("fetch {url}: {e}"))?
        .into_body()
        .read_to_string()
        .map_err(|e| anyhow!("read body: {e}"))?;
    Ok(body)
}

/// ExtractHost returns `example_com` from a URL.
pub fn extract_host(raw_url: &str) -> String {
    let no_scheme = raw_url
        .trim_start_matches("http://")
        .trim_start_matches("https://");
    let host = no_scheme.split('/').next().unwrap_or("");
    let host = host.split(':').next().unwrap_or(host);
    let host = host.strip_prefix("www.").unwrap_or(host);
    if host.is_empty() {
        "output".to_string()
    } else {
        host.replace('.', "_")
    }
}

/// extract_readable uses the readability crate to pull article content.
pub fn extract_readable(html: &str) -> Option<(String, String)> {
    let mut r = readability_rust::Readability::new(html, None).ok()?;
    let article = r.parse()?;
    let title = article.title.unwrap_or_default().trim().to_string();
    let content = article.content.unwrap_or_default().trim().to_string();
    if content.is_empty() || content.len() < 100 {
        return None;
    }
    Some((title, content))
}

/// convert_to_markdown via html2md.
pub fn convert_to_markdown(html: &str) -> Result<String> {
    let doc = html2md::parse_html(html);
    Ok(doc.trim_end().to_string())
}

/// Parse all <table> elements into rows of cells.
pub fn parse_tables(html: &str) -> Vec<Vec<Vec<String>>> {
    let doc = Html::parse_document(html);
    let table_sel = Selector::parse("table").unwrap();
    let mut tables = Vec::new();
    for table in doc.select(&table_sel) {
        let rows = parse_table(&table);
        if !rows.is_empty() {
            tables.push(rows);
        }
    }
    tables
}

fn parse_table(table: &scraper::ElementRef) -> Vec<Vec<String>> {
    let mut rows = Vec::new();
    for tr in table.select(&Selector::parse("tr").unwrap()) {
        let mut row = Vec::new();
        for cell in tr.select(&Selector::parse("td,th").unwrap()) {
            row.push(cell.text().collect::<String>().trim().to_string());
        }
        if !row.is_empty() {
            rows.push(row);
        }
    }
    rows
}

/// tables_to_csv_files writes each table to `<host>.csv` or `<host>-table-<i>.csv`.
pub fn tables_to_csv_files(
    tables: &[Vec<Vec<String>>],
    page_url: &str,
    out_dir: &str,
) -> Result<Vec<String>> {
    let host = extract_host(page_url);
    let mut paths = Vec::new();
    for (i, table) in tables.iter().enumerate() {
        if table.is_empty() {
            continue;
        }
        let filename = if tables.len() > 1 {
            format!("{host}-table-{i}.csv")
        } else {
            format!("{host}.csv")
        };
        let file_path = format!("{out_dir}/{filename}");
        let mut wtr =
            csv::Writer::from_path(&file_path).map_err(|e| anyhow!("create {file_path}: {e}"))?;
        for row in table {
            wtr.write_record(row)
                .map_err(|e| anyhow!("write csv: {e}"))?;
        }
        wtr.flush().map_err(|e| anyhow!("flush csv: {e}"))?;
        let abs = std::fs::canonicalize(&file_path)
            .map(|p| p.display().to_string())
            .unwrap_or(file_path);
        paths.push(abs);
    }
    Ok(paths)
}

/// Raw GET returning body bytes as String (for wttr.in which isn't JSON API).
pub fn fetch_page_raw(url: &str) -> Result<String> {
    let agent = ureq::Agent::config_builder()
        .timeout_global(Some(std::time::Duration::from_secs(15)))
        .build()
        .new_agent();
    agent
        .get(url)
        .call()
        .map_err(|e| anyhow!("fetch {url}: {e}"))?
        .into_body()
        .read_to_string()
        .map_err(|e| anyhow!("read body: {e}"))
}
