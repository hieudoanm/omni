use super::internal;
use anyhow::{anyhow, Result};
use clap::Args;
use std::path::Path;

#[derive(Args)]
pub struct SplitArgs {
    /// CSV file to split
    #[arg()]
    pub file: String,
    /// Input format (csv or excel)
    #[arg(long, default_value = "csv")]
    pub format: String,
    /// Rows per chunk
    #[arg(long, default_value_t = 1000)]
    pub rows: usize,
    /// Output directory
    #[arg(long, short = 'o', default_value = "")]
    pub output: String,
}

pub fn run(args: &SplitArgs) -> Result<()> {
    if args.format == "excel" {
        return Err(anyhow!("excel format not yet supported, use csv"));
    }
    let records = internal::read_csv_records(std::slice::from_ref(&args.file))?;
    if records.is_empty() {
        return Ok(());
    }
    let (header, rows) = records.split_first().unwrap();

    let output_dir = if args.output.is_empty() {
        Path::new(&args.file)
            .parent()
            .map(|p| p.to_path_buf())
            .unwrap_or_else(|| Path::new(".").to_path_buf())
    } else {
        Path::new(&args.output).to_path_buf()
    };
    let base = Path::new(&args.file)
        .file_name()
        .map(|n| n.to_string_lossy().to_string())
        .unwrap_or_default();
    let name_no_ext = Path::new(&base)
        .file_stem()
        .map(|s| s.to_string_lossy().to_string())
        .unwrap_or(base);

    for (i, chunk_rows) in rows.chunks(args.rows.max(1)).enumerate() {
        if chunk_rows.is_empty() {
            break;
        }
        let mut chunk = vec![header.clone()];
        chunk.extend(chunk_rows.iter().cloned());
        let out_file = output_dir.join(format!("{name_no_ext}_part_{:03}.csv", i + 1));
        internal::write_csv(out_file.to_str().unwrap_or(""), &chunk)?;
        println!("Created: {}", out_file.display());
    }
    Ok(())
}
