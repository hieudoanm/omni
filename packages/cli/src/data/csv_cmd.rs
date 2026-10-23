use super::internal;
use anyhow::Result;
use clap::Args;

#[derive(Args)]
pub struct CsvArgs {
    /// CSV file (or stdin)
    #[arg()]
    pub file: Option<String>,
}

pub fn run(args: &CsvArgs, json: bool) -> Result<()> {
    let file_args: Vec<String> = args.file.iter().cloned().collect();
    let records = internal::read_csv_records(&file_args)?;
    if json {
        println!("{}", internal::format_csv_json(&records));
    } else {
        println!("{}", internal::format_csv_text(&records));
    }
    Ok(())
}
