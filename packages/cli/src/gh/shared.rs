//! Shared GitHub helpers (port of cli.go/src/cmd/gh/shared).
use anyhow::{anyhow, Result};

pub fn github_token() -> String {
    std::env::var("GITHUB_TOKEN").unwrap_or_default()
}

/// GitHub API GET with the same headers the Go CLI sends.
pub fn fetch(url: &str) -> Result<Vec<u8>> {
    let mut headers = vec![
        ("Accept".to_string(), "application/json".to_string()),
        ("User-Agent".to_string(), "omni-cli".to_string()),
    ];
    let token = github_token();
    if !token.is_empty() {
        headers.push(("Authorization".to_string(), format!("Bearer {token}")));
    }
    crate::requests::request("GET", url, None, &headers).map_err(|e| anyhow!("{e}"))
}

pub fn language_colors() -> &'static [(&'static str, &'static str)] {
    &[
        ("Go", "#00ADD8"),
        ("TypeScript", "#3178C6"),
        ("JavaScript", "#F7DF1E"),
        ("Python", "#3572A5"),
        ("Java", "#B07219"),
        ("Rust", "#DEA584"),
        ("C", "#555555"),
        ("C++", "#F34B7D"),
        ("C#", "#178600"),
        ("Ruby", "#701516"),
        ("PHP", "#4F5D95"),
        ("Swift", "#F05138"),
        ("Kotlin", "#A97BFF"),
        ("Scala", "#C22D40"),
        ("Shell", "#89E051"),
        ("HTML", "#E34F26"),
        ("CSS", "#563D7C"),
        ("Vue", "#41B883"),
        ("Svelte", "#FF3E00"),
        ("Dart", "#00B4AB"),
        ("Lua", "#000080"),
        ("R", "#198CE7"),
        ("Haskell", "#5E5086"),
        ("Elixir", "#6E4A7E"),
        ("Clojure", "#DB5855"),
        ("Erlang", "#B83998"),
        ("Zig", "#EC915C"),
        ("Nix", "#7EBAE4"),
        ("Solidity", "#AA6746"),
        ("YAML", "#CB171E"),
        ("Markdown", "#083FA1"),
        ("Dockerfile", "#384D54"),
        ("Makefile", "#427819"),
        ("CMake", "#DA3434"),
        ("TeX", "#3D6117"),
    ]
}

pub fn language_color(name: &str) -> &'static str {
    language_colors()
        .iter()
        .find(|(n, _)| *n == name)
        .map(|(_, c)| *c)
        .unwrap_or("#6e7681")
}

/// survey.Select equivalent: print numbered options, read a choice.
pub fn select(prompt: &str, options: &[String]) -> anyhow::Result<String> {
    println!("{prompt}");
    for (i, o) in options.iter().enumerate() {
        println!("  {}) {o}", i + 1);
    }
    let mut input = String::new();
    std::io::stdin().read_line(&mut input)?;
    let idx: usize = input.trim().parse().unwrap_or(1);
    options
        .get(idx.saturating_sub(1))
        .cloned()
        .ok_or_else(|| anyhow!("selection cancelled"))
}
