use std::process::Command;

fn run(cmd: &str, args: &[&str]) -> Option<String> {
    let out = Command::new(cmd).args(args).output().ok()?;
    if !out.status.success() {
        return None;
    }
    String::from_utf8(out.stdout)
        .ok()
        .map(|s| s.trim().to_string())
}

fn main() {
    if let Ok(v) = std::env::var("OMNI_VERSION") {
        println!("cargo:rustc-env=OMNI_VERSION={v}");
    } else {
        let date = run("date", &["+%Y.%m.%d.%H.%M.%S"]).unwrap_or_else(|| "dev".into());
        let sha = run("git", &["rev-parse", "--short", "HEAD"]).unwrap_or_else(|| "unknown".into());
        println!("cargo:rustc-env=OMNI_VERSION={date}-{sha}");
    }
    println!("cargo:rerun-if-env-changed=OMNI_VERSION");
}
