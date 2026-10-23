use super::internal;
use anyhow::{anyhow, Result};
use clap::Args;

#[derive(Args)]
pub struct ScanArgs {
    /// Root directory to scan
    #[arg(long, default_value = ".")]
    pub dir: String,
    /// Output .graphml file path
    #[arg(long, default_value = "codebase.graphml")]
    pub out: String,
    /// Comma-separated directories to exclude
    #[arg(
        long,
        default_value = ".git,node_modules,vendor,dist,.next,__pycache__"
    )]
    pub exclude: String,
    /// Print progress to stderr
    #[arg(long)]
    pub verbose: bool,
}

pub fn run(args: &ScanArgs) -> Result<()> {
    let abs_dir =
        std::fs::canonicalize(&args.dir).map_err(|e| anyhow!("error resolving directory: {e}"))?;
    let exclude = internal::parse_exclude_list(&args.exclude);

    if args.verbose {
        eprintln!("scanning {}", abs_dir.display());
    }

    let files = internal::walk(&abs_dir, &exclude);
    if args.verbose {
        eprintln!("found {} source files", files.len());
    }

    let mut graph = internal::Graph::new();
    for f in &files {
        if args.verbose {
            eprintln!("  extracting: {}", f.rel_path);
        }
        match internal::extract(f.clone()) {
            Ok(info) => graph.add_file(&info),
            Err(e) => eprintln!("  warning: skipping {}: {e}", f.rel_path),
        }
    }
    graph.resolve_call_edges();

    internal::writer::write(&graph, &args.out).map_err(|e| anyhow!("write error: {e}"))?;

    println!("graph written to {}", args.out);
    println!(
        "  nodes: {}  edges: {}",
        graph.node_count(),
        graph.edge_count()
    );
    Ok(())
}
