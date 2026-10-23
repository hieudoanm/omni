use std::collections::HashSet;

pub fn parse_exclude_list(s: &str) -> HashSet<String> {
    s.split(',')
        .map(str::trim)
        .filter(|p| !p.is_empty())
        .map(str::to_string)
        .collect()
}
