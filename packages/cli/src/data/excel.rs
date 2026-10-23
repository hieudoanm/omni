use anyhow::Result;
use clap::{Args, Subcommand};

#[derive(Args)]
pub struct ExcelArgs {
    #[command(subcommand)]
    pub command: Option<ExcelCommand>,
}

#[derive(Subcommand)]
pub enum ExcelCommand {
    /// Convert Excel to CSV
    #[command(name = "to-csv")]
    ToCsv(ToCsvArgs),
    /// Convert Excel to JSON
    #[command(name = "to-json")]
    ToJson(ToJsonArgs),
    /// Show Excel file information
    Info(InfoArgs),
}

#[derive(Args)]
pub struct ToCsvArgs {
    /// XLSX file
    #[arg()]
    pub file: String,
    /// Output directory
    #[arg(long, short = 'o', default_value = "")]
    pub output: String,
}

#[derive(Args)]
pub struct ToJsonArgs {
    /// XLSX file
    #[arg()]
    pub file: String,
    /// Pretty-print JSON output
    #[arg(long)]
    pub pretty: bool,
}

#[derive(Args)]
pub struct InfoArgs {
    /// XLSX file
    #[arg()]
    pub file: String,
}

pub fn run(args: &ExcelArgs) -> Result<()> {
    match &args.command {
        Some(ExcelCommand::ToCsv(a)) => run_to_csv(a),
        Some(ExcelCommand::ToJson(a)) => run_to_json(a),
        Some(ExcelCommand::Info(a)) => run_info(a),
        None => {
            println!("Convert Excel files to CSV/JSON, or show sheet info.\n");
            println!("Usage:\n  omni data excel [command]\n");
            println!("Available Commands:");
            println!("  info     Show Excel file information");
            println!("  to-csv   Convert Excel to CSV");
            println!("  to-json  Convert Excel to JSON");
            println!("\nFlags:\n  -h, --help   help for excel");
            Ok(())
        }
    }
}

fn run_to_csv(args: &ToCsvArgs) -> Result<()> {
    let sheets =
        super::xlsx::parse_xlsx(&args.file).map_err(|e| anyhow::anyhow!("parse xlsx: {e}"))?;
    let output_dir = if args.output.is_empty() {
        std::path::Path::new(&args.file)
            .parent()
            .map(|p| p.to_path_buf())
            .unwrap_or_else(|| std::path::Path::new(".").to_path_buf())
    } else {
        std::path::Path::new(&args.output).to_path_buf()
    };
    let base = std::path::Path::new(&args.file)
        .file_stem()
        .map(|s| s.to_string_lossy().to_string())
        .unwrap_or_default();
    for sheet in &sheets {
        let sheet_name = if sheet.name.is_empty() {
            "Sheet1"
        } else {
            &sheet.name
        };
        let out_file = output_dir.join(format!("{base}_{sheet_name}.csv"));
        super::internal::write_csv(out_file.to_str().unwrap_or(""), &sheet.rows)?;
        println!("Created: {}", out_file.display());
    }
    Ok(())
}

fn run_to_json(args: &ToJsonArgs) -> Result<()> {
    let sheets =
        super::xlsx::parse_xlsx(&args.file).map_err(|e| anyhow::anyhow!("parse xlsx: {e}"))?;
    #[derive(serde::Serialize)]
    struct SheetOutput {
        name: String,
        rows: Vec<Vec<String>>,
    }
    let output: Vec<SheetOutput> = sheets
        .iter()
        .map(|s| SheetOutput {
            name: s.name.clone(),
            rows: s.rows.clone(),
        })
        .collect();
    let data = if args.pretty {
        serde_json::to_string_pretty(&output)
    } else {
        serde_json::to_string(&output)
    }
    .map_err(|e| anyhow::anyhow!("marshal json: {e}"))?;
    println!("{data}");
    Ok(())
}

fn run_info(args: &InfoArgs) -> Result<()> {
    let sheets =
        super::xlsx::parse_xlsx(&args.file).map_err(|e| anyhow::anyhow!("parse xlsx: {e}"))?;
    println!("File: {}", args.file);
    println!("Sheets: {}\n", sheets.len());
    let mut total_rows = 0usize;
    for (i, sheet) in sheets.iter().enumerate() {
        let row_count = sheet.rows.len();
        let col_count = sheet.rows.iter().map(|r| r.len()).max().unwrap_or(0);
        total_rows += row_count;
        println!("  {}. {}", i + 1, sheet.name);
        println!("     Rows: {row_count}");
        println!("     Columns: {col_count}");
    }
    println!("\nTotal rows: {total_rows}");
    Ok(())
}
