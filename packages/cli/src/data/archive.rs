use anyhow::{anyhow, Result};
use clap::Args;
use std::fs::File;
use std::io::{Read, Write};
use std::path::Path;

#[derive(Args)]
pub struct ArchiveArgs {
    /// Files to archive (or zip to extract)
    #[arg()]
    pub files: Vec<String>,
    /// Action to perform (create or extract)
    #[arg(long, default_value = "create")]
    pub action: String,
    /// Output file (create) or directory (extract)
    #[arg(long, short = 'o', default_value = "")]
    pub output: String,
}

pub fn run(args: &ArchiveArgs) -> Result<()> {
    match args.action.as_str() {
        "create" => run_create(&args.files, &args.output),
        "extract" => {
            if args.files.len() != 1 {
                return Err(anyhow!(
                    "extract requires exactly one argument: the zip file"
                ));
            }
            run_extract(&args.files[0], &args.output)
        }
        a => Err(anyhow!("unknown action: {a} (use create or extract)")),
    }
}

fn run_create(files: &[String], output: &str) -> Result<()> {
    if files.is_empty() {
        return Err(anyhow!("at least one file required"));
    }
    let mut out = if output.is_empty() {
        "archive.zip".to_string()
    } else {
        output.to_string()
    };
    if Path::new(&out).extension().is_none() {
        out.push_str(".zip");
    }

    let file = File::create(&out).map_err(|e| anyhow!("create archive: {e}"))?;
    let mut zip = zip::ZipWriter::new(file);
    let opts = zip::write::SimpleFileOptions::default()
        .compression_method(zip::CompressionMethod::Deflated);

    for f in files {
        let meta = std::fs::metadata(f).map_err(|e| anyhow!("stat {f}: {e}"))?;
        if meta.is_dir() {
            return Err(anyhow!("directories not supported: {f}"));
        }
        let name = Path::new(f)
            .file_name()
            .map(|n| n.to_string_lossy().to_string())
            .unwrap_or_else(|| f.clone());
        zip.start_file(name, opts).map_err(|e| anyhow!("{e}"))?;
        let mut buf = Vec::new();
        File::open(f)
            .map_err(|e| anyhow!("open {f}: {e}"))?
            .read_to_end(&mut buf)
            .map_err(|e| anyhow!("write {f}: {e}"))?;
        zip.write_all(&buf).map_err(|e| anyhow!("write {f}: {e}"))?;
    }
    zip.finish().map_err(|e| anyhow!("{e}"))?;
    println!("Created: {out}");
    Ok(())
}

fn run_extract(zip_file: &str, output: &str) -> Result<()> {
    let file = File::open(zip_file).map_err(|e| anyhow!("open zip: {e}"))?;
    let mut archive = zip::ZipArchive::new(file).map_err(|e| anyhow!("open zip: {e}"))?;
    let out_dir = if output.is_empty() { "." } else { output };

    for i in 0..archive.len() {
        let mut entry = archive.by_index(i).map_err(|e| anyhow!("{e}"))?;
        let name = entry.name().map_err(|e| anyhow!("{e}"))?.to_string();
        if name.contains("..") {
            continue;
        }
        let path = Path::new(out_dir).join(&name);
        if entry.is_dir() {
            std::fs::create_dir_all(&path)?;
            continue;
        }
        if let Some(parent) = path.parent() {
            std::fs::create_dir_all(parent)?;
        }
        let mut out = File::create(&path).map_err(|e| anyhow!("create {}: {e}", path.display()))?;
        std::io::copy(&mut entry, &mut out).map_err(|e| anyhow!("{e}"))?;
    }
    Ok(())
}
