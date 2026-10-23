package engine

import (
	"fmt"
	"strings"
	"time"

	chess "github.com/hieudoanm/omni/packages/cli/src/cmd/chess/internal"
)

type Piece int8
type Color int8

const (
	Empty Piece = 0
	WP    Piece = 1
	WN    Piece = 2
	WB    Piece = 3
	WR    Piece = 4
	WQ    Piece = 5
	WK    Piece = 6
	BP    Piece = -1
	BN    Piece = -2
	BB    Piece = -3
	BR    Piece = -4
	BQ    Piece = -5
	BK    Piece = -6
)

const (
	White Color = 1
	Black Color = -1
)

var pieceValue = map[Piece]int{
	WP: 100, WN: 320, WB: 330, WR: 500, WQ: 900, WK: 20000,
	BP: 100, BN: 320, BB: 330, BR: 500, BQ: 900, BK: 20000,
}

type Move struct {
	from int
	to   int
	prom Piece
	cap  Piece
}

type Game struct {
	board      [64]Piece
	sideToMove Color
	history    []Move
}

func NewGame() Game {
	var g Game
	startFEN := "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w"
	g.parseFEN(startFEN)
	return g
}

func (g *Game) parseFEN(fen string) {
	parts := strings.Split(fen, " ")
	rows := strings.Split(parts[0], "/")
	i := 56
	for _, r := range rows {
		var file int
		for _, ch := range r {
			if ch >= '1' && ch <= '8' {
				empty := int(ch - '0')
				for k := 0; k < empty; k++ {
					g.board[i+file] = Empty
					file++
				}
			} else {
				var p Piece
				switch ch {
				case 'p':
					p = BP
				case 'r':
					p = BR
				case 'n':
					p = BN
				case 'b':
					p = BB
				case 'q':
					p = BQ
				case 'k':
					p = BK
				case 'P':
					p = WP
				case 'R':
					p = WR
				case 'N':
					p = WN
				case 'B':
					p = WB
				case 'Q':
					p = WQ
				case 'K':
					p = WK
				}
				g.board[i+file] = p
				file++
			}
		}
		i -= 8
	}
	if len(parts) > 1 && parts[1] == "w" {
		g.sideToMove = White
	} else {
		g.sideToMove = Black
	}
	g.history = nil
}

var knightOffsets = []int{17, 15, 10, 6, -6, -10, -15, -17}
var kingOffsets = []int{1, -1, 8, -8, 9, 7, -7, -9}
var bishopDirs = []int{9, 7, -7, -9}
var rookDirs = []int{8, -8, 1, -1}
var queenDirs = []int{9, 7, -7, -9, 8, -8, 1, -1}

func sqToRC(sq int) (r, c int) {
	return sq / 8, sq % 8
}

func insideBoard(sq int) bool {
	return sq >= 0 && sq < 64
}

func (g *Game) GenerateLegalMoves() []Move {
	var moves []Move
	side := g.sideToMove
	for sq := 0; sq < 64; sq++ {
		p := g.board[sq]
		if p == Empty || Color(signOf(p)) != side {
			continue
		}
		switch absPiece(p) {
		case WP, BP:
			moves = append(moves, g.generatePawnMoves(sq)...)
		case WN, BN:
			moves = append(moves, g.generateKnightMoves(sq)...)
		case WB, BB:
			moves = append(moves, g.generateSliderMoves(sq, bishopDirs)...)
		case WR, BR:
			moves = append(moves, g.generateSliderMoves(sq, rookDirs)...)
		case WQ, BQ:
			moves = append(moves, g.generateSliderMoves(sq, queenDirs)...)
		case WK, BK:
			moves = append(moves, g.generateKingMoves(sq)...)
		}
	}
	var legal []Move
	for _, mv := range moves {
		captured := g.board[mv.to]
		g.makeMoveNoRecord(mv)
		kingSafe := !g.isKingAttacked(g.sideToMove.Opposite())
		g.unmakeMoveNoRecord(mv, captured)
		if kingSafe {
			legal = append(legal, mv)
		}
	}
	return legal
}

func (g *Game) generatePawnMoves(sq int) []Move {
	var res []Move
	p := g.board[sq]
	side := signOf(p)
	r, c := sqToRC(sq)
	dir := 8 * side
	fwd := sq + dir
	if insideBoard(fwd) && g.board[fwd] == Empty {
		if (side == 1 && r == 6) || (side == -1 && r == 1) {
			for _, prom := range []Piece{WQ, WR, WB, WN} {
				if side == -1 {
					prom = Piece(int8(-prom))
				}
				res = append(res, Move{from: sq, to: fwd, prom: prom, cap: Empty})
			}
		} else {
			res = append(res, Move{from: sq, to: fwd, prom: Empty, cap: Empty})
			if (side == 1 && r == 1) || (side == -1 && r == 6) {
				double := sq + dir*2
				if insideBoard(double) && g.board[double] == Empty {
					res = append(res, Move{from: sq, to: double, prom: Empty, cap: Empty})
				}
			}
		}
	}
	for _, dc := range []int{-1, 1} {
		cf := c + dc
		if cf < 0 || cf > 7 {
			continue
		}
		to := fwd + dc
		if !insideBoard(to) {
			continue
		}
		if g.board[to] != Empty && signOf(g.board[to]) == -side {
			if (side == 1 && r == 6) || (side == -1 && r == 1) {
				for _, prom := range []Piece{WQ, WR, WB, WN} {
					if side == -1 {
						prom = Piece(int8(-prom))
					}
					res = append(res, Move{from: sq, to: to, prom: prom, cap: g.board[to]})
				}
			} else {
				res = append(res, Move{from: sq, to: to, prom: Empty, cap: g.board[to]})
			}
		}
	}
	return res
}

func (g *Game) generateKnightMoves(sq int) []Move {
	var res []Move
	p := g.board[sq]
	side := signOf(p)
	for _, off := range knightOffsets {
		to := sq + off
		if !insideBoard(to) {
			continue
		}
		if !knightWrapOK(sq, to) {
			continue
		}
		if g.board[to] == Empty || signOf(g.board[to]) == -side {
			res = append(res, Move{from: sq, to: to, cap: g.board[to]})
		}
	}
	return res
}

func knightWrapOK(from, to int) bool {
	fr, fc := sqToRC(from)
	tr, tc := sqToRC(to)
	dr := chess.Abs(fr - tr)
	dc := chess.Abs(fc - tc)
	return (dr == 1 && dc == 2) || (dr == 2 && dc == 1)
}

func (g *Game) generateSliderMoves(sq int, dirs []int) []Move {
	var res []Move
	p := g.board[sq]
	side := signOf(p)
	for _, d := range dirs {
		to := sq + d
		for insideBoard(to) && !isWraparound(sq, to, d) {
			if g.board[to] == Empty {
				res = append(res, Move{from: sq, to: to, cap: Empty})
			} else {
				if signOf(g.board[to]) == -side {
					res = append(res, Move{from: sq, to: to, cap: g.board[to]})
				}
				break
			}
			to += d
		}
	}
	return res
}

func (g *Game) generateKingMoves(sq int) []Move {
	var res []Move
	p := g.board[sq]
	side := signOf(p)
	for _, off := range kingOffsets {
		to := sq + off
		if !insideBoard(to) || isWraparound(sq, to, off) {
			continue
		}
		if g.board[to] == Empty || signOf(g.board[to]) == -side {
			res = append(res, Move{from: sq, to: to, cap: g.board[to]})
		}
	}
	return res
}

func isWraparound(from, to, d int) bool {
	fr, fc := sqToRC(from)
	tr, tc := sqToRC(to)
	_ = tr
	_ = fr
	if chess.Abs(fc-tc) > 2 {
		return true
	}
	return false
}

func signOf(p Piece) int {
	if p < 0 {
		return -1
	}
	if p > 0 {
		return 1
	}
	return 0
}

func absPiece(p Piece) Piece {
	if p < 0 {
		return -p
	}
	return p
}

func (c Color) Opposite() Color {
	if c == White {
		return Black
	}
	return White
}

func (g *Game) MakeMove(m Move) {
	captured := g.board[m.to]
	moved := g.board[m.from]
	if m.prom != Empty {
		g.board[m.to] = m.prom
	} else {
		g.board[m.to] = moved
	}
	g.board[m.from] = Empty
	g.history = append(g.history, Move{from: m.from, to: m.to, prom: m.prom, cap: captured})
	g.sideToMove = g.sideToMove.Opposite()
}

func (g *Game) UndoMove() {
	if len(g.history) == 0 {
		return
	}
	last := g.history[len(g.history)-1]
	movedPiece := g.board[last.to]
	if last.prom != Empty {
		if g.sideToMove == White {
			g.board[last.from] = Piece(int8(-int(last.prom)))
		} else {
			g.board[last.from] = Piece(int8(last.prom))
		}
	} else {
		g.board[last.from] = movedPiece
	}
	g.board[last.to] = last.cap
	g.history = g.history[:len(g.history)-1]
	g.sideToMove = g.sideToMove.Opposite()
}

func (g *Game) makeMoveNoRecord(m Move) {
	moved := g.board[m.from]
	if m.prom != Empty {
		g.board[m.to] = m.prom
	} else {
		g.board[m.to] = moved
	}
	g.board[m.from] = Empty
	g.sideToMove = g.sideToMove.Opposite()
}

func (g *Game) unmakeMoveNoRecord(m Move, captured Piece) {
	if m.prom != Empty {
		if g.sideToMove == White {
			g.board[m.from] = Piece(int8(-int(m.prom)))
		} else {
			g.board[m.from] = m.prom
		}
	} else {
		g.board[m.from] = g.board[m.to]
	}
	g.board[m.to] = captured
	g.sideToMove = g.sideToMove.Opposite()
}

func (g *Game) isKingAttacked(side Color) bool {
	var kingSq int = -1
	var kingPiece Piece = WK
	if side == Black {
		kingPiece = BK
	}
	for i := 0; i < 64; i++ {
		if g.board[i] == kingPiece {
			kingSq = i
			break
		}
	}
	if kingSq == -1 {
		return false
	}
	opp := side.Opposite()
	for _, off := range knightOffsets {
		to := kingSq + off
		if !insideBoard(to) || !knightWrapOK(kingSq, to) {
			continue
		}
		p := g.board[to]
		if p != Empty && signOf(p) == int(opp) && absPiece(p) == WN {
			return true
		}
	}
	kR, kC := sqToRC(kingSq)
	for _, dc := range []int{-1, 1} {
		r := kR - int(opp)
		c := kC + dc
		if r < 0 || r > 7 || c < 0 || c > 7 {
			continue
		}
		sq := r*8 + c
		p := g.board[sq]
		if p != Empty && signOf(p) == int(opp) && absPiece(p) == WP {
			return true
		}
	}
	for _, d := range queenDirs {
		to := kingSq + d
		for insideBoard(to) && !isWraparound(kingSq, to, d) {
			p := g.board[to]
			if p == Empty {
				to += d
				continue
			}
			if signOf(p) == int(opp) {
				ap := absPiece(p)
				if (d == 1 || d == -1 || d == 8 || d == -8) && (ap == WR || ap == WQ) {
					return true
				}
				if (d == 9 || d == 7 || d == -7 || d == -9) && (ap == WB || ap == WQ) {
					return true
				}
			}
			break
		}
	}
	for _, off := range kingOffsets {
		to := kingSq + off
		if !insideBoard(to) || isWraparound(kingSq, to, off) {
			continue
		}
		p := g.board[to]
		if p != Empty && signOf(p) == int(opp) && absPiece(p) == WK {
			return true
		}
	}
	return false
}

func (g *Game) Eval() int {
	var score int
	for i := 0; i < 64; i++ {
		p := g.board[i]
		if p == Empty || p == WK || p == BK {
			continue
		}
		v := pieceValue[p]
		if signOf(p) == 1 {
			score += v
		} else {
			score -= v
		}
	}
	return score
}

func (g *Game) EngineMove(depth int) Move {
	best := Move{}
	bestScore := -99999999
	start := time.Now()
	moves := g.GenerateLegalMoves()
	if len(moves) == 0 {
		return best
	}
	sortMovesCapturesFirst(moves)
	for _, m := range moves {
		captured := g.board[m.to]
		g.makeMoveNoRecord(m)
		score := -g.negamax(depth-1, -99999999, 99999999)
		g.unmakeMoveNoRecord(m, captured)
		if score > bestScore {
			bestScore = score
			best = m
		}
		if time.Since(start) > time.Second*30 {
			break
		}
	}
	return best
}

func (g *Game) negamax(depth, alpha, beta int) int {
	if depth == 0 {
		return g.Eval() * int(g.sideToMove)
	}
	moves := g.GenerateLegalMoves()
	if len(moves) == 0 {
		if g.isKingAttacked(g.sideToMove) {
			return -1000000 * int(g.sideToMove)
		}
		return 0
	}
	sortMovesCapturesFirst(moves)
	value := -99999999
	for _, m := range moves {
		captured := g.board[m.to]
		g.makeMoveNoRecord(m)
		score := -g.negamax(depth-1, -beta, -alpha)
		g.unmakeMoveNoRecord(m, captured)
		if score > value {
			value = score
		}
		if value > alpha {
			alpha = value
		}
		if alpha >= beta {
			break
		}
	}
	return value
}

func sortMovesCapturesFirst(moves []Move) {
	for i := 0; i < len(moves); i++ {
		for j := i + 1; j < len(moves); j++ {
			if moves[j].cap != Empty && moves[i].cap == Empty {
				moves[i], moves[j] = moves[j], moves[i]
			}
		}
	}
}

func (g *Game) Perft(depth int) int {
	if depth == 0 {
		return 1
	}
	var nodes int
	moves := g.GenerateLegalMoves()
	for _, m := range moves {
		captured := g.board[m.to]
		g.makeMoveNoRecord(m)
		nodes += g.Perft(depth - 1)
		g.unmakeMoveNoRecord(m, captured)
	}
	return nodes
}

func sqFromAlgebraic(s string) (int, bool) {
	if len(s) != 2 {
		return 0, false
	}
	file := s[0] - 'a'
	rank := s[1] - '1'
	if file < 0 || file > 7 || rank < 0 || rank > 7 {
		return 0, false
	}
	return int(rank)*8 + int(file), true
}

func formatMove(m Move) string {
	return fmt.Sprintf("%s%s", algebraicFrom(m.from), algebraicFrom(m.to))
}

func algebraicFrom(sq int) string {
	r, c := sqToRC(sq)
	return fmt.Sprintf("%c%d", 'a'+c, r+1)
}
