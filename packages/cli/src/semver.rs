use anyhow::{anyhow, Result};
use clap::{Args as ClapArgs, Subcommand};

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Version {
    pub major: i64,
    pub minor: i64,
    pub patch: i64,
    pub prerelease: String,
}

impl Version {
    pub fn parse(s: &str) -> Result<Version> {
        let s = s.strip_prefix('v').unwrap_or(s);
        let parts: Vec<&str> = s.splitn(3, '.').collect();
        if parts.len() < 3 {
            return Err(anyhow!("invalid semver: {s} (need major.minor.patch)"));
        }
        let major: i64 = parts[0]
            .parse()
            .map_err(|_| anyhow!("invalid major version: {}", parts[0]))?;
        let minor: i64 = parts[1]
            .parse()
            .map_err(|_| anyhow!("invalid minor version: {}", parts[1]))?;
        let mut patch_str = parts[2];
        let mut prerelease = String::new();
        if let Some(idx) = patch_str.find('-') {
            prerelease = patch_str[idx + 1..].to_string();
            patch_str = &patch_str[..idx];
        }
        let patch: i64 = patch_str
            .parse()
            .map_err(|_| anyhow!("invalid patch version: {patch_str}"))?;
        Ok(Version {
            major,
            minor,
            patch,
            prerelease,
        })
    }

    pub fn bump(&self, part: &str) -> Version {
        match part {
            "major" => Version {
                major: self.major + 1,
                minor: 0,
                patch: 0,
                prerelease: String::new(),
            },
            "minor" => Version {
                major: self.major,
                minor: self.minor + 1,
                patch: 0,
                prerelease: String::new(),
            },
            "patch" => Version {
                major: self.major,
                minor: self.minor,
                patch: self.patch + 1,
                prerelease: String::new(),
            },
            _ => self.clone(),
        }
    }

    /// Returns negative if self < other, 0 if equal, positive if self > other.
    pub fn compare(&self, other: &Version) -> i64 {
        if self.major != other.major {
            return self.major - other.major;
        }
        if self.minor != other.minor {
            return self.minor - other.minor;
        }
        if self.patch != other.patch {
            return self.patch - other.patch;
        }
        if self.prerelease != other.prerelease {
            if self.prerelease.is_empty() {
                return 1;
            }
            if other.prerelease.is_empty() {
                return -1;
            }
            return if self.prerelease < other.prerelease {
                -1
            } else {
                1
            };
        }
        0
    }

    pub fn check_range(&self, range_expr: &str) -> Result<bool> {
        let parts: Vec<&str> = range_expr.split_whitespace().collect();
        if parts.is_empty() {
            return Err(anyhow!("empty range expression"));
        }
        let mut i = 0;
        while i < parts.len() {
            let op = parts[i];
            if i + 1 >= parts.len() {
                return Err(anyhow!("incomplete range: missing version after {op}"));
            }
            let ver = Version::parse(parts[i + 1])
                .map_err(|_| anyhow!("invalid version in range: {}", parts[i + 1]))?;
            let cmp = self.compare(&ver);
            let ok = match op {
                ">" => cmp > 0,
                ">=" => cmp >= 0,
                "<" => cmp < 0,
                "<=" => cmp <= 0,
                "=" | "==" => cmp == 0,
                _ => return Err(anyhow!("unknown operator: {op}")),
            };
            if !ok {
                return Ok(false);
            }
            i += 2;
        }
        Ok(true)
    }
}

impl std::fmt::Display for Version {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}.{}.{}", self.major, self.minor, self.patch)?;
        if !self.prerelease.is_empty() {
            write!(f, "-{}", self.prerelease)?;
        }
        Ok(())
    }
}

#[derive(ClapArgs)]
#[command(
    about = "Parse, compare, sort, and bump semver strings",
    long_about = "Tools for working with semantic version strings (major.minor.patch)."
)]
pub struct SemverArgs {
    #[command(subcommand)]
    pub command: Option<SemverCommand>,
    /// Bump version part: major, minor, patch
    #[arg(long, default_value = "")]
    pub bump: String,
    /// Set prerelease label after bump
    #[arg(long, default_value = "")]
    pub prerelease: String,
    /// Check if version matches a range (e.g. '>=1.0.0 <2.0.0')
    #[arg(long, default_value = "")]
    pub range: String,
    /// Single version for --bump or --range
    #[arg(long, default_value = "")]
    pub version: String,
    /// Output in JSON format
    #[arg(long, short = 'j', global = true)]
    pub json: bool,
}

#[derive(Subcommand)]
pub enum SemverCommand {
    /// Validate one or more semver strings
    Validate(ValidateArgs),
    /// Compare two semver strings
    Compare(CompareArgs),
    /// Sort semver strings
    Sort(SortArgs),
}

#[derive(clap::Args)]
pub struct ValidateArgs {
    /// Comma-separated versions to validate
    #[arg(long, value_delimiter = ',')]
    pub versions: Vec<String>,
}

#[derive(clap::Args)]
pub struct CompareArgs {
    /// First version
    #[arg(long, default_value = "")]
    pub a: String,
    /// Second version
    #[arg(long, default_value = "")]
    pub b: String,
}

#[derive(clap::Args)]
pub struct SortArgs {
    /// Comma-separated versions to sort
    #[arg(long, value_delimiter = ',')]
    pub versions: Vec<String>,
}

fn run_validate(versions: &[String], json: bool) -> Result<()> {
    if versions.is_empty() {
        return Err(anyhow!("need at least one version: use --versions"));
    }
    if json {
        let results: Vec<serde_json::Value> = versions
            .iter()
            .map(|s| match Version::parse(s) {
                Ok(_) => serde_json::json!({"version": s, "valid": true}),
                Err(e) => serde_json::json!({"version": s, "valid": false, "error": e.to_string()}),
            })
            .collect();
        println!("{}", serde_json::to_string_pretty(&results)?);
    } else {
        for s in versions {
            match Version::parse(s) {
                Ok(_) => println!("{s}: valid"),
                Err(e) => println!("{s}: invalid ({e})"),
            }
        }
    }
    Ok(())
}

fn run_compare(a_str: &str, b_str: &str, json: bool) -> Result<()> {
    if a_str.is_empty() || b_str.is_empty() {
        return Err(anyhow!("need both --a and --b versions"));
    }
    let a = Version::parse(a_str)?;
    let b = Version::parse(b_str)?;
    let cmp = a.compare(&b);
    let rel = if cmp < 0 {
        "<"
    } else if cmp > 0 {
        ">"
    } else {
        "=="
    };
    if json {
        println!(
            "{}",
            serde_json::to_string_pretty(&serde_json::json!({
                "a": a.to_string(),
                "b": b.to_string(),
                "relation": rel,
            }))?
        );
    } else {
        println!("{a} {rel} {b}");
    }
    Ok(())
}

fn run_sort(versions: &[String], json: bool) -> Result<()> {
    if versions.is_empty() {
        return Err(anyhow!("need at least one version: use --versions"));
    }
    let mut parsed = Vec::with_capacity(versions.len());
    for s in versions {
        parsed.push(Version::parse(s).map_err(|e| anyhow!("{s}: {e}"))?);
    }
    parsed.sort_by(|a, b| a.compare(b).cmp(&0));
    if json {
        let sorted: Vec<String> = parsed.iter().map(|v| v.to_string()).collect();
        println!(
            "{}",
            serde_json::to_string_pretty(&serde_json::json!({"sorted": sorted}))?
        );
    } else {
        for v in &parsed {
            println!("{v}");
        }
    }
    Ok(())
}

fn run_root(args: &SemverArgs) -> Result<()> {
    if !args.bump.is_empty() {
        let v = Version::parse(&args.version)?;
        let mut result = v.bump(&args.bump);
        if !args.prerelease.is_empty() {
            result.prerelease = args.prerelease.clone();
        }
        if args.json {
            println!(
                "{}",
                serde_json::to_string_pretty(&serde_json::json!({
                    "input": args.version,
                    "result": result.to_string(),
                    "bump": args.bump,
                    "prerelease": args.prerelease,
                }))?
            );
        } else {
            println!("{result}");
        }
        return Ok(());
    }
    if !args.range.is_empty() {
        if args.version.is_empty() {
            return Err(anyhow!(
                "need a version to check against range: use --version"
            ));
        }
        let v = Version::parse(&args.version)?;
        let matches = v.check_range(&args.range)?;
        if args.json {
            println!(
                "{}",
                serde_json::to_string_pretty(&serde_json::json!({
                    "version": args.version,
                    "range": args.range,
                    "matches": matches,
                }))?
            );
        } else if matches {
            println!("{} matches range {}", v, args.range);
        } else {
            println!("{} does NOT match range {}", v, args.range);
        }
        return Ok(());
    }
    let mut cmd = <SemverArgs as ClapArgs>::augment_args(clap::Command::new("semver"));
    let _ = cmd.print_help();
    Ok(())
}

pub fn run(args: &SemverArgs) -> Result<()> {
    match &args.command {
        Some(SemverCommand::Validate(a)) => run_validate(&a.versions, args.json),
        Some(SemverCommand::Compare(a)) => run_compare(&a.a, &a.b, args.json),
        Some(SemverCommand::Sort(a)) => run_sort(&a.versions, args.json),
        None => run_root(args),
    }
}
