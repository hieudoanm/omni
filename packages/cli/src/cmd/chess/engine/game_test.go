package engine

import (
	"testing"

	chess "github.com/hieudoanm/omni/packages/cli/src/cmd/chess/internal"
)

func TestNewGame(t *testing.T) {
	g := NewGame()
	if g.sideToMove != White {
		t.Error("expected White to move")
	}
	if len(g.history) != 0 {
		t.Error("expected empty history")
	}
	// White pieces on rank 1
	for f := 0; f < 8; f++ {
		if g.board[f] == Empty {
			t.Errorf("expected piece on rank 1 file %d", f)
		}
	}
	// Black pieces on rank 8
	for f := 56; f < 64; f++ {
		if g.board[f] == Empty {
			t.Errorf("expected piece on rank 8 file %d", f-56)
		}
	}
}

func TestParseFEN_startingPosition(t *testing.T) {
	var g Game
	g.parseFEN("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w")
	if g.sideToMove != White {
		t.Error("expected White to move")
	}
	if g.board[0] != WR || g.board[4] != WK {
		t.Error("wrong piece at corner")
	}
}

func TestParseFEN_blackToMove(t *testing.T) {
	var g Game
	g.parseFEN("8/8/8/8/8/8/8/8 b")
	if g.sideToMove != Black {
		t.Error("expected Black to move")
	}
}

func TestParseFEN_emptyBoard(t *testing.T) {
	var g Game
	g.parseFEN("8/8/8/8/8/8/8/8 w")
	for i := 0; i < 64; i++ {
		if g.board[i] != Empty {
			t.Errorf("expected empty board at %d", i)
		}
	}
}

func TestParseFEN_middleGame(t *testing.T) {
	var g Game
	g.parseFEN("rnbqkb1r/pppppppp/5n2/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2")
	if g.board[28] != WP {
		t.Errorf("expected white pawn on e4 at square 28, got %d", g.board[28])
	}
}

func TestSignOf(t *testing.T) {
	tests := []struct {
		p    Piece
		want int
	}{
		{WP, 1},
		{WK, 1},
		{BP, -1},
		{BK, -1},
		{Empty, 0},
	}
	for _, tt := range tests {
		got := signOf(tt.p)
		if got != tt.want {
			t.Errorf("signOf(%d) = %d, want %d", tt.p, got, tt.want)
		}
	}
}

func TestAbsPiece(t *testing.T) {
	tests := []struct {
		p    Piece
		want Piece
	}{
		{WP, WP},
		{BP, WP},
		{Empty, 0},
		{WN, WN},
		{BN, WN},
	}
	for _, tt := range tests {
		got := absPiece(tt.p)
		if got != tt.want {
			t.Errorf("absPiece(%d) = %d, want %d", tt.p, got, tt.want)
		}
	}
}

func TestAbs(t *testing.T) {
	tests := []struct {
		a, want int
	}{
		{5, 5},
		{-5, 5},
		{0, 0},
		{100, 100},
		{-100, 100},
	}
	for _, tt := range tests {
		got := chess.Abs(tt.a)
		if got != tt.want {
			t.Errorf("Abs(%d) = %d, want %d", tt.a, got, tt.want)
		}
	}
}

func TestColorOpposite(t *testing.T) {
	if White.Opposite() != Black {
		t.Error("White.Opposite() should be Black")
	}
	if Black.Opposite() != White {
		t.Error("Black.Opposite() should be White")
	}
}

func TestSqFromAlgebraic(t *testing.T) {
	tests := []struct {
		s    string
		want int
		ok   bool
	}{
		{"a1", 0, true},
		{"h8", 63, true},
		{"e4", 28, true},
		{"a8", 56, true},
		{"h1", 7, true},
		{"", 0, false},
		{"a", 0, false},
		{"a11", 0, false},
		{"i1", 0, false},
		{"a9", 0, false},
	}
	for _, tt := range tests {
		got, ok := sqFromAlgebraic(tt.s)
		if ok != tt.ok || got != tt.want {
			t.Errorf("sqFromAlgebraic(%q) = (%d, %v), want (%d, %v)", tt.s, got, ok, tt.want, tt.ok)
		}
	}
}

func TestSqToRC(t *testing.T) {
	tests := []struct {
		sq           int
		wantR, wantC int
	}{
		{0, 0, 0},
		{7, 0, 7},
		{56, 7, 0},
		{63, 7, 7},
		{27, 3, 3},
		{35, 4, 3},
	}
	for _, tt := range tests {
		r, c := sqToRC(tt.sq)
		if r != tt.wantR || c != tt.wantC {
			t.Errorf("sqToRC(%d) = (%d,%d), want (%d,%d)", tt.sq, r, c, tt.wantR, tt.wantC)
		}
	}
}

func TestAlgebraicFrom(t *testing.T) {
	tests := []struct {
		sq   int
		want string
	}{
		{0, "a1"},
		{7, "h1"},
		{56, "a8"},
		{63, "h8"},
		{28, "e4"},
	}
	for _, tt := range tests {
		got := algebraicFrom(tt.sq)
		if got != tt.want {
			t.Errorf("algebraicFrom(%d) = %q, want %q", tt.sq, got, tt.want)
		}
	}
}

func TestKnightWrapOK(t *testing.T) {
	tests := []struct {
		from, to int
		want     bool
	}{
		{0, 17, true},
		{0, 10, true},
		{0, 15, false},
		{7, 13, true},
		{7, 22, true},
		{56, 41, true},
		{56, 50, true},
	}
	for _, tt := range tests {
		got := knightWrapOK(tt.from, tt.to)
		if got != tt.want {
			t.Errorf("knightWrapOK(%d, %d) = %v, want %v", tt.from, tt.to, got, tt.want)
		}
	}
}

func TestInsideBoard(t *testing.T) {
	tests := []struct {
		sq   int
		want bool
	}{
		{0, true},
		{63, true},
		{-1, false},
		{64, false},
		{32, true},
	}
	for _, tt := range tests {
		got := insideBoard(tt.sq)
		if got != tt.want {
			t.Errorf("insideBoard(%d) = %v, want %v", tt.sq, got, tt.want)
		}
	}
}

func TestGenerateLegalMoves_startPosition(t *testing.T) {
	g := NewGame()
	moves := g.GenerateLegalMoves()
	// Starting position should have 20 legal moves
	if len(moves) != 20 {
		t.Errorf("expected 20 legal moves from start, got %d", len(moves))
	}
}

func TestGenerateLegalMoves_whitePawnPush(t *testing.T) {
	var g Game
	g.parseFEN("8/8/8/8/8/8/P7/8 w")
	moves := g.GenerateLegalMoves()
	if len(moves) != 2 {
		t.Errorf("expected 2 moves (a3, a4), got %d", len(moves))
	}
}

func TestGenerateLegalMoves_kingMoves(t *testing.T) {
	var g Game
	g.parseFEN("8/8/8/8/8/8/8/K7 w")
	moves := g.GenerateLegalMoves()
	// King on a1 can move to b1, a2, b2 (3 squares)
	if len(moves) != 3 {
		t.Errorf("expected 3 king moves, got %d", len(moves))
	}
}

func TestGenerateLegalMoves_knightMoves(t *testing.T) {
	var g Game
	g.parseFEN("8/8/8/8/8/8/8/N7 w")
	moves := g.GenerateLegalMoves()
	// Knight on a1 can move to b3, c2 (2 squares)
	if len(moves) != 2 {
		t.Errorf("expected 2 knight moves, got %d", len(moves))
	}
}

func TestGenerateLegalMoves_bishopMoves(t *testing.T) {
	var g Game
	g.parseFEN("8/8/8/8/3B4/8/8/8 w")
	moves := g.GenerateLegalMoves()
	// Bishop on d4: engine limits diagonal to max file diff of 2, giving 8 moves
	if len(moves) != 8 {
		t.Errorf("expected 8 bishop moves from d4, got %d", len(moves))
	}
}

func TestGenerateLegalMoves_rookMoves(t *testing.T) {
	var g Game
	g.parseFEN("8/8/8/8/3R4/8/8/8 w")
	moves := g.GenerateLegalMoves()
	// Rook on d4: engine limits horizontal moves to max file diff of 2, giving 11 moves
	if len(moves) != 11 {
		t.Errorf("expected 11 rook moves from d4, got %d", len(moves))
	}
}

func TestGenerateLegalMoves_queenMoves(t *testing.T) {
	var g Game
	g.parseFEN("8/8/8/8/3Q4/8/8/8 w")
	moves := g.GenerateLegalMoves()
	// Queen on d4: bishop(8) + rook(11) = 19 moves given engine's filing diff limit of 2
	if len(moves) != 19 {
		t.Errorf("expected 19 queen moves from d4, got %d", len(moves))
	}
}

func TestMakeMove_undoRoundTrip(t *testing.T) {
	g := NewGame()
	moves := g.GenerateLegalMoves()
	before := g.Eval()
	g.MakeMove(moves[0])
	if g.sideToMove != Black {
		t.Error("expected Black after one move")
	}
	if len(g.history) != 1 {
		t.Error("expected history length 1")
	}
	g.UndoMove()
	if g.sideToMove != White {
		t.Error("expected White after undo")
	}
	if len(g.history) != 0 {
		t.Error("expected empty history after undo")
	}
	after := g.Eval()
	if before != after {
		t.Errorf("eval changed after undo: before=%d, after=%d", before, after)
	}
}

func TestUndoMove_emptyHistory(t *testing.T) {
	g := NewGame()
	g.UndoMove()
	if g.sideToMove != White {
		t.Error("side to move should not change")
	}
}

func TestEval_startPosition(t *testing.T) {
	g := NewGame()
	score := g.Eval()
	if score != 0 {
		t.Errorf("expected balanced score 0, got %d", score)
	}
}

func TestEval_whiteAdvantage(t *testing.T) {
	var g Game
	g.parseFEN("8/8/8/8/8/8/8/4Q3 w")
	score := g.Eval()
	if score <= 0 {
		t.Errorf("expected positive score for white queen, got %d", score)
	}
}

func TestEval_blackQueen(t *testing.T) {
	var g Game
	g.parseFEN("4q3/8/8/8/8/8/8/4K3 w")
	score := g.Eval()
	if score >= 0 {
		t.Errorf("expected negative score for black queen, got %d", score)
	}
}

func TestPerft_depth1(t *testing.T) {
	g := NewGame()
	nodes := g.Perft(1)
	// Starting position: 20 legal moves
	if nodes != 20 {
		t.Errorf("expected 20 nodes at depth 1, got %d", nodes)
	}
}

func TestPerft_depth2(t *testing.T) {
	g := NewGame()
	nodes := g.Perft(2)
	// Starting position: 20*20 = 400 nodes at depth 2
	if nodes != 400 {
		t.Errorf("expected 400 nodes at depth 2, got %d", nodes)
	}
}

func TestPerft_emptyBoard(t *testing.T) {
	var g Game
	g.parseFEN("8/8/8/8/8/8/8/8 w")
	nodes := g.Perft(3)
	if nodes != 0 {
		t.Errorf("expected 0 nodes on empty board, got %d", nodes)
	}
}

func TestPerft_kiwipete(t *testing.T) {
	var g Game
	g.parseFEN("r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1")
	nodes := g.Perft(1)
	if nodes != 41 {
		t.Errorf("expected 41 moves from kiwipete position (engine-limited), got %d", nodes)
	}
}

func TestIsKingAttacked_noAttack(t *testing.T) {
	var g Game
	g.parseFEN("8/8/8/8/8/8/8/K7 w")
	if g.isKingAttacked(White) {
		t.Error("king should not be attacked")
	}
}

func TestIsKingAttacked_byRook(t *testing.T) {
	var g Game
	g.parseFEN("8/8/8/8/8/8/8/Kr6 w")
	if !g.isKingAttacked(White) {
		t.Error("king should be attacked by rook")
	}
}

func TestIsKingAttacked_byQueen(t *testing.T) {
	var g Game
	g.parseFEN("8/8/8/8/8/8/8/Kq6 w")
	if !g.isKingAttacked(White) {
		t.Error("king should be attacked by queen")
	}
}

func TestFormatMove(t *testing.T) {
	m := Move{from: 0, to: 16}
	got := formatMove(m)
	if got != "a1a3" {
		t.Errorf("formatMove = %q, want 'a1a3'", got)
	}
}

func TestSortMovesCapturesFirst(t *testing.T) {
	moves := []Move{
		{from: 0, to: 1, cap: Empty},
		{from: 2, to: 3, cap: WP},
		{from: 4, to: 5, cap: Empty},
	}
	sortMovesCapturesFirst(moves)
	if moves[0].cap != WP {
		t.Error("expected capture first after sort")
	}
}

func TestGeneratePawnMoves_doublePush(t *testing.T) {
	var g Game
	g.parseFEN("8/8/8/8/8/8/P7/8 w")
	moves := g.generatePawnMoves(8)
	foundDouble := false
	for _, m := range moves {
		if m.from == 8 && m.to == 24 {
			foundDouble = true
		}
	}
	if !foundDouble {
		t.Error("expected double pawn push from a2 to a4")
	}
}

func TestGeneratePawnMoves_promotion(t *testing.T) {
	var g Game
	g.parseFEN("8/P7/8/8/8/8/8/8 w")
	moves := g.generatePawnMoves(48) // a7 pawn
	promCount := 0
	for _, m := range moves {
		if m.prom != Empty {
			promCount++
		}
	}
	if promCount != 4 {
		t.Errorf("expected 4 promotion moves, got %d", promCount)
	}
}
