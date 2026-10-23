//! FEN utilities (ported from cli.go chess/fen).
pub mod eval;
pub mod svg;

use anyhow::Result;
use clap::{Args, Subcommand};

#[derive(Args)]
pub struct FenArgs {
    #[command(subcommand)]
    pub command: FenCommand,
}

#[derive(Subcommand)]
pub enum FenCommand {
    /// Evaluate a FEN position using Lichess cloud eval
    Eval(eval::EvalArgs),
    /// Render a FEN position as an SVG board image
    Svg(svg::SvgArgs),
}

pub fn run(args: &FenArgs) -> Result<()> {
    match &args.command {
        FenCommand::Eval(a) => eval::run(a),
        FenCommand::Svg(a) => svg::run(a),
    }
}
