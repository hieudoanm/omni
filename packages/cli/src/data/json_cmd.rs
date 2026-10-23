use super::internal;
use anyhow::Result;
use clap::Args;

#[derive(Args)]
pub struct JsonArgs {
    /// JSON file(s)
    #[arg()]
    pub files: Vec<String>,
    /// JQ-like query (e.g. .name, .items[0])
    #[arg(long, short = 'q', default_value = "")]
    pub query: String,
    /// Diff with another JSON file
    #[arg(long, default_value = "")]
    pub diff: String,
    /// Merge with another JSON file (patch)
    #[arg(long, default_value = "")]
    pub merge: String,
}

pub fn run(args: &JsonArgs) -> Result<()> {
    if !args.diff.is_empty() {
        let f1 = args.files.first().cloned().unwrap_or_default();
        return internal::json_diff(&f1, &args.diff);
    }
    if !args.merge.is_empty() {
        let f1 = args.files.first().cloned().unwrap_or_default();
        return internal::json_merge(&f1, &args.merge);
    }

    let input_args: Vec<String> = args.files.iter().take(1).cloned().collect();
    let input = internal::read_input(&input_args)?;

    if !args.query.is_empty() {
        let data = internal::parse_json(&input)?;
        let result = internal::json_query(&data, &args.query)?;
        println!("{}", internal::output_json(result));
        return Ok(());
    }

    let data = internal::parse_json(&input)?;
    println!("{}", internal::output_json(&data));
    Ok(())
}
