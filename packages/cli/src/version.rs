use serde::Serialize;

pub const VERSION: &str = env!("OMNI_VERSION");

#[derive(clap::Args)]
pub struct Args {
    /// Output in JSON format
    #[arg(long, short = 'j')]
    pub json: bool,
}

#[derive(Serialize)]
struct VersionOutput {
    version: &'static str,
}

pub fn run(args: &Args) -> anyhow::Result<()> {
    if args.json {
        println!(
            "{}",
            serde_json::to_string_pretty(&VersionOutput { version: VERSION })?
        );
    } else {
        println!("Version: {VERSION}");
    }
    Ok(())
}
