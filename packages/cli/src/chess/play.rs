//! Interactive chess play (ported from cli.go chess/play; notnil/chess -> shakmaty).
use anyhow::Result;
use clap::Args;
use shakmaty::{fen::Fen, san::San, Board, CastlingMode, Color, File, Position, Rank, Square};
use std::io::{self, BufRead, Write};

#[derive(Args)]
pub struct PlayArgs {
    /// Blind mode: don't display the board
    #[arg(long)]
    pub blind: bool,
    /// Output in JSON format
    #[arg(long, short = 'j', global = true)]
    pub json: bool,
}

fn draw_board(board: &Board) -> String {
    let mut out = String::new();
    out.push_str("  +-----------------+\n");
    for rank in (0..8).rev() {
        out.push_str(&format!("{} |", rank + 1));
        for file in 0..8 {
            let sq = Square::from((File::new(file as u32), Rank::new(rank as u32)));
            let ch = match board.piece_at(sq) {
                Some(p) => {
                    let letter = match p.role {
                        shakmaty::Role::Pawn => 'p',
                        shakmaty::Role::Knight => 'n',
                        shakmaty::Role::Bishop => 'b',
                        shakmaty::Role::Rook => 'r',
                        shakmaty::Role::Queen => 'q',
                        shakmaty::Role::King => 'k',
                    };
                    if p.color == Color::White {
                        letter.to_ascii_uppercase()
                    } else {
                        letter
                    }
                }
                None => '.',
            };
            out.push_str(&format!(" {ch}"));
        }
        out.push_str(" |\n");
    }
    out.push_str("  +-----------------+\n");
    out.push_str("    a b c d e f g h\n");
    out
}

pub fn run(args: &PlayArgs) -> Result<()> {
    let mut pos: shakmaty::Chess =
        Fen::from_ascii(b"rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1")
            .map_err(|e| anyhow::anyhow!("startpos: {e}"))?
            .into_position(CastlingMode::Standard)
            .map_err(|e| anyhow::anyhow!("startpos: {e}"))?;
    let stdin = io::stdin();
    let mut lines = stdin.lock().lines();

    println!("♟ Chess CLI - Interactive Play");
    println!("Type moves in SAN (e.g., e4, Nf3). Type 'exit' to quit.");
    if args.blind {
        println!("Blind mode is ON. Board will not be displayed. Type 'show' to view the board temporarily.");
    }
    println!();

    let mut sans: Vec<String> = Vec::new();
    let mut uci_moves: Vec<String> = Vec::new();

    loop {
        let outcome = pos.outcome();
        if outcome.is_known() {
            break;
        }
        if !args.blind {
            print!("{}", draw_board(pos.board()));
        }
        let turn = if pos.turn() == Color::White {
            "White"
        } else {
            "Black"
        };
        print!("{turn} to move: ");
        let _ = io::stdout().flush();
        let line = match lines.next() {
            Some(Ok(l)) => l.trim().to_string(),
            Some(Err(_)) | None => {
                println!("Exiting game (EOF).");
                break;
            }
        };
        if line.is_empty() {
            continue;
        }
        if line == "exit" {
            println!("Exiting game.");
            break;
        }
        if args.blind && line == "show" {
            print!("{}", draw_board(pos.board()));
            continue;
        }
        let san = match San::from_ascii(line.as_bytes()) {
            Ok(s) => s,
            Err(_) => {
                println!("❌ Invalid or illegal move: {line}");
                continue;
            }
        };
        let m = match san.to_move(&pos) {
            Ok(m) => m,
            Err(e) => {
                println!("❌ Invalid or illegal move: {e}");
                continue;
            }
        };
        let uci = shakmaty::uci::UciMove::from_move(m, CastlingMode::Standard);
        let mut us = String::new();
        uci.append_to_string(&mut us);
        match pos.clone().play(m) {
            Ok(new_pos) => {
                pos = new_pos;
                sans.push(line.clone());
                uci_moves.push(us);
            }
            Err(e) => println!("❌ Invalid or illegal move: {e}"),
        }
    }

    println!("\n♟ Game PGN:");
    // Simple movetext reconstruction (headers omitted, matching spirit of Go
    // which prints the full PGN including headers).
    let mut movetext = String::new();
    for (i, san) in sans.iter().enumerate() {
        if i % 2 == 0 {
            movetext.push_str(&format!("{}. ", i / 2 + 1));
        }
        movetext.push_str(san);
        movetext.push(' ');
    }
    println!("{movetext}");
    println!("\n♟ Game UCI:");
    println!("{}", uci_moves.join(" "));

    let outcome = pos.outcome();
    if outcome.is_known() {
        println!(
            "Game over: {}",
            match outcome {
                shakmaty::Outcome::Known(k) => k.to_string(),
                _ => "*".to_string(),
            }
        );
        if pos.is_checkmate() {
            println!("Method: Checkmate");
        } else if pos.is_stalemate() {
            println!("Method: Stalemate");
        }
    }
    Ok(())
}
