use anyhow::Result;
use clap::Args;

#[derive(Args)]
pub struct UuidArgs {
    /// Number of UUIDs to generate
    #[arg(long, short = 'n', default_value_t = 1)]
    pub count: usize,
}

pub fn run(args: &UuidArgs, json: bool) -> Result<()> {
    let uuids: Vec<String> = (0..args.count)
        .map(|_| uuid::Uuid::new_v4().to_string())
        .collect();
    if json {
        println!(
            "{}",
            serde_json::to_string_pretty(&serde_json::json!({
                "uuids": uuids, "count": args.count,
            }))?
        );
    } else {
        println!("{}", uuids.join("\n"));
    }
    Ok(())
}
