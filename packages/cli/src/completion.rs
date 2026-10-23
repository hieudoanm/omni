use crate::cli;
use anyhow::Result;
use std::io::Write;

#[derive(clap::Args)]
pub struct Args {
    /// Shell type (bash, zsh, fish)
    #[arg(long, short = 's', default_value = "")]
    pub shell: String,
}

pub fn run(args: &Args) -> Result<()> {
    let mut cmd = cli::command();
    let mut out = std::io::stdout();
    match args.shell.as_str() {
        "bash" => clap_complete::generate(clap_complete::shells::Bash, &mut cmd, "omni", &mut out),
        "zsh" => clap_complete::generate(clap_complete::shells::Zsh, &mut cmd, "omni", &mut out),
        "fish" => clap_complete::generate(clap_complete::shells::Fish, &mut cmd, "omni", &mut out),
        other => {
            return Err(anyhow::anyhow!(
                "unsupported shell: {other} (use bash, zsh, or fish)"
            ))
        }
    }
    out.flush()?;
    Ok(())
}
