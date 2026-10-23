use std::collections::HashSet;
use std::path::{Path, PathBuf};

#[derive(Clone, Debug)]
pub struct File {
    pub abs_path: PathBuf,
    pub rel_path: String,
    pub lang: Language,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Language {
    Go,
    TypeScript,
    JavaScript,
    Python,
    Rust,
    Unknown,
}

impl Language {
    pub fn as_str(&self) -> &'static str {
        match self {
            Language::Go => "go",
            Language::TypeScript => "typescript",
            Language::JavaScript => "javascript",
            Language::Python => "python",
            Language::Rust => "rust",
            Language::Unknown => "unknown",
        }
    }
}

fn ext_lang(ext: &str) -> Option<Language> {
    Some(match ext {
        ".go" => Language::Go,
        ".ts" | ".tsx" => Language::TypeScript,
        ".js" | ".jsx" => Language::JavaScript,
        ".py" => Language::Python,
        ".rs" => Language::Rust,
        _ => return None,
    })
}

/// Walk root recursively, collecting source files. Dot-prefixed names and
/// excluded directory/file names are skipped; errors on entries are ignored.
pub fn walk(root: &Path, exclude: &HashSet<String>) -> Vec<File> {
    let mut files = Vec::new();
    walk_dir(root, root, exclude, &mut files);
    files
}

fn walk_dir(dir: &Path, root: &Path, exclude: &HashSet<String>, out: &mut Vec<File>) {
    let Ok(entries) = std::fs::read_dir(dir) else {
        return;
    };
    for entry in entries.flatten() {
        let name = entry.file_name();
        let name = name.to_string_lossy();
        let path = entry.path();
        let is_dir = path.is_dir();

        if name != "." && (name.starts_with('.') || exclude.contains(name.as_ref())) {
            if is_dir {
                continue;
            }
        } else if !is_dir {
            let ext = path
                .extension()
                .map(|e| format!(".{}", e.to_string_lossy()))
                .unwrap_or_default();
            if let Some(lang) = ext_lang(&ext) {
                let rel = pathdiff(root, &path);
                out.push(File {
                    abs_path: path.clone(),
                    rel_path: rel,
                    lang,
                });
            }
        }

        if is_dir {
            walk_dir(&path, root, exclude, out);
        }
    }
}

/// filepath.Rel equivalent: path relative to root using '/' separators.
pub fn pathdiff(root: &Path, path: &Path) -> String {
    let rel = path.strip_prefix(root).unwrap_or(path);
    rel.components()
        .map(|c| c.as_os_str().to_string_lossy())
        .collect::<Vec<_>>()
        .join("/")
}
