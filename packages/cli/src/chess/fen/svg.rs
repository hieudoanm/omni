use anyhow::{anyhow, Result};
use clap::Args;
use serde_json::json;

#[derive(Args)]
pub struct SvgArgs {
    /// FEN position string
    #[arg(long)]
    pub fen: String,
    /// Output SVG file
    #[arg(long)]
    pub out: String,
    /// Output in JSON format
    #[arg(long, short = 'j', global = true)]
    pub json: bool,
}

fn render_board_svg() -> String {
    // Mirrors Go renderBoardSVG: validates the FEN via shakmaty but draws
    // only the checkerboard squares (upstream does not render pieces).
    const SQUARE: i32 = 60;
    const SIZE: i32 = SQUARE * 8;
    let mut svg =
        format!(r#"<svg xmlns="http://www.w3.org/2000/svg" width="{SIZE}" height="{SIZE}">"#);
    for rank in 0..8 {
        for file in 0..8 {
            let x = file * SQUARE;
            let y = (7 - rank) * SQUARE;
            let color = if (rank + file) % 2 == 1 {
                "#f0d9b5"
            } else {
                "#b58863"
            };
            svg.push_str(&format!(
                r#"<rect x="{x}" y="{y}" width="{SQUARE}" height="{SQUARE}" fill="{color}"/>"#
            ));
        }
    }
    svg.push_str("</svg>");
    svg
}

pub fn run(args: &SvgArgs) -> Result<()> {
    if args.fen.is_empty() {
        return Err(anyhow!("❌ you must provide a FEN string using --fen"));
    }
    let output_file = if args.out.is_empty() {
        "board.svg".to_string()
    } else {
        args.out.clone()
    };
    let _pos = shakmaty::fen::Fen::from_ascii(args.fen.as_bytes())
        .map_err(|e| anyhow!("❌ failed to parse FEN: {e}"))?
        .into_position::<shakmaty::Chess>(shakmaty::CastlingMode::Standard)
        .map_err(|e| anyhow!("❌ failed to parse FEN: {e}"))?;
    std::fs::write(&output_file, render_board_svg())
        .map_err(|e| anyhow!("❌ failed to write SVG: {e}"))?;
    if args.json {
        println!(
            "{}",
            serde_json::to_string_pretty(&json!({"output": output_file}))?
        );
    } else {
        println!("✅ SVG saved to {output_file}");
    }
    Ok(())
}
