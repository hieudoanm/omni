use super::internal;
use anyhow::{anyhow, Result};
use clap::Args;

#[derive(Args)]
pub struct YmlArgs {
    /// YAML file (or stdin)
    #[arg()]
    pub file: Option<String>,
    /// Validate YAML syntax
    #[arg(long, short = 'V')]
    pub validate: bool,
    /// Lint YAML file
    #[arg(long)]
    pub lint: bool,
}

pub fn run(args: &YmlArgs, json: bool) -> Result<()> {
    let file_args: Vec<String> = args.file.iter().cloned().collect();
    let input = internal::read_input(&file_args)?;
    let json_out = json;
    let fname = args.file.clone().unwrap_or_default();

    if args.validate {
        internal::validate_yml(&input).map_err(|e| anyhow!("invalid YAML: {e}"))?;
        if json_out {
            println!(
                "{{\"valid\":true,\"file\":{}}}",
                serde_json::to_string(&fname)?
            );
        } else {
            println!("Valid YAML");
        }
        return Ok(());
    }
    if args.lint {
        internal::validate_yml(&input).map_err(|e| anyhow!("YAML error: {e}"))?;
        if json_out {
            println!("{{\"valid\":true,\"lint\":\"no issues\"}}");
        } else {
            println!("No lint issues found");
        }
        return Ok(());
    }

    let data = internal::parse_yml(&input)?;
    if json_out {
        println!("{}", internal::yml_to_json(&data));
    } else {
        print!("{}", internal::format_yml(&data)?);
    }
    Ok(())
}
