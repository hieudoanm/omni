use anyhow::Result;
use clap::Args;

#[derive(Args)]
pub struct ListArgs {}

pub fn run(_args: &ListArgs, json: bool) -> Result<()> {
    let names = super::internal::palette_names();
    if json {
        let list: Vec<&str> = names.to_vec();
        println!("{}", serde_json::to_string(&list)?);
    } else {
        for n in names {
            println!("{n}");
        }
    }
    Ok(())
}
