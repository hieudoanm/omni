use crate::requests;
use anyhow::{anyhow, Result};
use clap::{Args as ClapArgs, Subcommand};
use serde::{Deserialize, Serialize};
use std::io::{self, Write};

#[derive(ClapArgs)]
#[command(
    about = "DOI productivity tools",
    long_about = "Tools for working with Digital Object Identifiers (DOIs): fetch metadata, generate citations, and validate identifiers."
)]
pub struct DoiArgs {
    #[command(subcommand)]
    pub command: Option<DoiCommand>,
    /// Output in JSON format
    #[arg(long, short = 'j', global = true)]
    pub json: bool,
}

#[derive(Subcommand)]
pub enum DoiCommand {
    /// Generate an APA citation from a DOI
    Cite(DoiInputArgs),
    /// Generate a formatted reference from a DOI
    Ref(DoiInputArgs),
    /// Fetch raw metadata for a DOI
    Fetch(DoiInputArgs),
    /// Validate a DOI string format
    Validate(DoiInputArgs),
}

#[derive(clap::Args)]
pub struct DoiInputArgs {
    /// DOI identifier
    #[arg()]
    pub doi: Option<String>,
}

#[derive(Debug, Default, Deserialize, Serialize)]
pub struct Author {
    #[serde(default)]
    pub given: String,
    #[serde(default)]
    pub family: String,
}

#[derive(Debug, Default, Deserialize, Serialize)]
pub struct Message {
    #[serde(default)]
    pub author: Option<Vec<Author>>,
    #[serde(default)]
    pub title: Option<Vec<String>>,
    #[serde(rename = "container-title", default)]
    pub container_title: Option<Vec<String>>,
    #[serde(default)]
    pub volume: String,
    #[serde(default)]
    pub issue: String,
    #[serde(default)]
    pub page: String,
    #[serde(rename = "published-print", default)]
    pub published_print: Option<PublishedPrint>,
}

#[derive(Debug, Default, Deserialize, Serialize)]
pub struct PublishedPrint {
    #[serde(rename = "date-parts", default)]
    pub date_parts: Option<Vec<Vec<i64>>>,
}

#[derive(Debug, Default, Deserialize, Serialize)]
pub struct CrossRefData {
    #[serde(default)]
    pub status: String,
    #[serde(default)]
    pub message: Message,
}

fn resolve_doi(doi: Option<&str>) -> Result<String> {
    if let Some(d) = doi {
        return Ok(d.to_string());
    }
    print!("DOI ID: ");
    io::stdout().flush()?;
    let mut buf = String::new();
    io::stdin().read_line(&mut buf)?;
    Ok(buf.trim_end_matches(['\r', '\n']).to_string())
}

fn fetch_crossref(id: &str) -> Result<CrossRefData> {
    let url = format!("https://api.crossref.org/works/{id}");
    let body = requests::get(&url).map_err(|e| anyhow!("fetch error: {e}"))?;
    serde_json::from_slice(&body).map_err(|e| anyhow!("parse error: {e}"))
}

fn is_valid_doi(id: &str) -> bool {
    let Some(rest) = id.strip_prefix("10.") else {
        return false;
    };
    let digits = rest.bytes().take_while(|b| b.is_ascii_digit()).count();
    if digits < 4 {
        return false;
    }
    let after = &rest[digits..];
    let Some(remainder) = after.strip_prefix('/') else {
        return false;
    };
    remainder.chars().any(|c| c != '\n')
}

fn year_of(msg: &Message) -> String {
    msg.published_print
        .as_ref()
        .and_then(|p| p.date_parts.as_ref())
        .and_then(|d| d.first())
        .and_then(|p| p.first())
        .map(|y| y.to_string())
        .unwrap_or_else(|| "n.d.".to_string())
}

fn print_citation(data: &CrossRefData) {
    let msg = &data.message;
    let year = year_of(msg);
    let authors = msg.author.as_deref().unwrap_or(&[]);
    let citation = match authors.len() {
        0 => format!("(Unknown, {year})"),
        1 => format!("({}, {year})", authors[0].family),
        2 => format!("({} & {}, {year})", authors[0].family, authors[1].family),
        _ => format!("({} et al., {year})", authors[0].family),
    };
    println!("Cite:");
    println!("{citation}");
}

fn print_reference(data: &CrossRefData) {
    let msg = &data.message;
    let authors = msg.author.as_deref().unwrap_or(&[]);
    let mut authors_apa = String::new();
    for (i, a) in authors.iter().enumerate() {
        let initial = a.given.chars().next().unwrap_or_default();
        let part = format!("{}, {}.", a.family, initial);
        if i == 0 {
            authors_apa.push_str(&part);
        } else if i == authors.len() - 1 {
            authors_apa.push_str(" & ");
            authors_apa.push_str(&part);
        } else {
            authors_apa.push_str(", ");
            authors_apa.push_str(&part);
        }
    }
    let title = msg
        .title
        .as_deref()
        .and_then(|t| t.first())
        .cloned()
        .unwrap_or_default();
    let journal = msg
        .container_title
        .as_deref()
        .and_then(|t| t.first())
        .cloned()
        .unwrap_or_default();
    let apa = format!(
        "{} ({}) {}. {}, {}({}), {}.",
        authors_apa,
        year_of(msg),
        title,
        journal,
        msg.volume,
        msg.issue,
        msg.page
    );
    println!("APA:");
    println!("{apa}");
}

fn doi_data_json(id: &str, data: &CrossRefData) -> serde_json::Value {
    serde_json::json!({"doi": id, "data": data})
}

pub fn run(args: &DoiArgs) -> Result<()> {
    let Some(command) = &args.command else {
        let mut cmd = <DoiArgs as ClapArgs>::augment_args(clap::Command::new("doi"));
        let _ = cmd.print_help();
        return Ok(());
    };
    match command {
        DoiCommand::Fetch(a) => {
            let id = resolve_doi(a.doi.as_deref())?;
            let data = fetch_crossref(&id)?;
            println!("{}", serde_json::to_string_pretty(&data)?);
            Ok(())
        }
        DoiCommand::Cite(a) => {
            let id = resolve_doi(a.doi.as_deref())?;
            let data = fetch_crossref(&id)?;
            if args.json {
                println!(
                    "{}",
                    serde_json::to_string_pretty(&doi_data_json(&id, &data))?
                );
            } else {
                print_citation(&data);
            }
            Ok(())
        }
        DoiCommand::Ref(a) => {
            let id = resolve_doi(a.doi.as_deref())?;
            let data = fetch_crossref(&id)?;
            if args.json {
                println!(
                    "{}",
                    serde_json::to_string_pretty(&doi_data_json(&id, &data))?
                );
            } else {
                print_reference(&data);
            }
            Ok(())
        }
        DoiCommand::Validate(a) => {
            let Some(id) = &a.doi else {
                if args.json {
                    println!(
                        "{}",
                        serde_json::to_string_pretty(
                            &serde_json::json!({"error": "doi is required"})
                        )?
                    );
                } else {
                    println!("Usage: doi validate <doi>");
                }
                return Ok(());
            };
            let valid = is_valid_doi(id);
            if args.json {
                println!(
                    "{}",
                    serde_json::to_string_pretty(&serde_json::json!({"doi": id, "valid": valid}))?
                );
            } else if valid {
                println!("✓ {id} is a valid DOI");
            } else {
                println!("✗ {id} is not a valid DOI format");
            }
            Ok(())
        }
    }
}
