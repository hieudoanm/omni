use super::internal;
use anyhow::{anyhow, Result};
use clap::Args;
use regex::Regex;

#[derive(Args)]
pub struct EditArgs {
    /// File path
    #[arg(long, short = 'f', default_value = "")]
    pub file: String,
    /// Text or pattern to replace
    #[arg(long, short = 'o', default_value = "")]
    pub old: String,
    /// Replacement text
    #[arg(long, default_value = "")]
    pub new: String,
    /// Interpret old as a regex pattern
    #[arg(long, short = 'r')]
    pub regex: bool,
    /// Preview changes without modifying the file
    #[arg(long, short = 'p')]
    pub preview: bool,
    /// Number of occurrences to replace (0 = all)
    #[arg(long, short = 'n', default_value_t = 0)]
    pub count: usize,
}

fn plural_s(n: usize) -> &'static str {
    if n == 1 {
        ""
    } else {
        "s"
    }
}

fn perform_edit(
    content: &str,
    old: &str,
    new_str: &str,
    use_regex: bool,
    count: usize,
) -> Result<(String, usize)> {
    if use_regex {
        let re = Regex::new(old).map_err(|e| anyhow!("invalid regex {old:?}: {e}"))?;
        if count > 0 {
            let mut match_count = 0usize;
            // Replace only the first `count` matches; Go's ReplaceAllStringFunc
            // with a counter achieves the same.
            let replaced = re
                .replace_all(content, |caps: &regex::Captures| {
                    if match_count < count {
                        match_count += 1;
                        new_str.to_string()
                    } else {
                        caps.get(0).unwrap().as_str().to_string()
                    }
                })
                .into_owned();
            return Ok((replaced, match_count));
        }
        let match_count = re.find_iter(content).count();
        let replaced = re.replace_all(content, new_str).into_owned();
        return Ok((replaced, match_count));
    }

    let match_count = content.matches(old).count();
    let reported = if count > 0 && count < match_count {
        count
    } else {
        match_count
    };
    if count > 0 {
        // Replace at most `count` occurrences.
        let mut out = String::with_capacity(content.len());
        let mut rest = content;
        let mut n = 0usize;
        while n < count {
            match rest.find(old) {
                Some(i) => {
                    out.push_str(&rest[..i]);
                    out.push_str(new_str);
                    rest = &rest[i + old.len()..];
                    n += 1;
                }
                None => break,
            }
        }
        out.push_str(rest);
        return Ok((out, reported));
    }
    Ok((content.replace(old, new_str), reported))
}

fn show_diff(before: &str, after: &str) {
    let b = internal::split_lines(before);
    let a = internal::split_lines(after);
    let max = b.len().max(a.len());
    for i in 0..max {
        let bl = b.get(i).cloned().unwrap_or_default();
        let al = a.get(i).cloned().unwrap_or_default();
        if bl != al {
            println!("- {bl}");
            println!("+ {al}");
        } else {
            println!("  {bl}");
        }
    }
}

fn build_diff(before: &str, after: &str) -> String {
    let b = internal::split_lines(before);
    let a = internal::split_lines(after);
    let max = b.len().max(a.len());
    let mut out = String::new();
    for i in 0..max {
        let bl = b.get(i).cloned().unwrap_or_default();
        let al = a.get(i).cloned().unwrap_or_default();
        if bl != al {
            if !bl.is_empty() {
                out.push_str(&format!("- {bl}\n"));
            }
            if !al.is_empty() {
                out.push_str(&format!("+ {al}\n"));
            }
        }
    }
    out.trim_end_matches('\n').to_string()
}

pub fn run(args: &EditArgs, json: bool) -> Result<()> {
    let meta = std::fs::metadata(&args.file)?;
    let content = std::fs::read_to_string(&args.file)?;
    let (replaced, match_count) =
        perform_edit(&content, &args.old, &args.new, args.regex, args.count)?;

    if match_count == 0 {
        if json {
            println!(
                "{}",
                serde_json::to_string_pretty(
                    &serde_json::json!({"file": args.file, "matches": 0})
                )?
            );
        } else {
            println!("No matches found in {}", args.file);
        }
        return Ok(());
    }

    if args.preview {
        if json {
            println!(
                "{}",
                serde_json::to_string_pretty(&serde_json::json!({
                    "file": args.file,
                    "matches": match_count,
                    "diff": build_diff(&content, &replaced),
                }))?
            );
        } else {
            println!(
                "── Preview for {} ({} match{}) ──",
                args.file,
                match_count,
                plural_s(match_count)
            );
            show_diff(&content, &replaced);
        }
        return Ok(());
    }

    // Preserve original file mode.
    #[cfg(unix)]
    let perm = {
        use std::os::unix::fs::PermissionsExt;
        meta.permissions().mode()
    };
    std::fs::write(&args.file, &replaced)
        .map_err(|e| anyhow!("error writing {}: {e}", args.file))?;
    #[cfg(unix)]
    {
        use std::os::unix::fs::PermissionsExt;
        std::fs::set_permissions(&args.file, std::fs::Permissions::from_mode(perm))?;
    }

    if json {
        println!(
            "{}",
            serde_json::to_string_pretty(
                &serde_json::json!({"file": args.file, "matches": match_count})
            )?
        );
    } else {
        println!(
            "Replaced {} occurrence{} in {}",
            match_count,
            plural_s(match_count),
            args.file
        );
    }
    Ok(())
}
