package rules

import (
	"testing"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/casino/internal"
)

func TestCardValue(t *testing.T) {
	tests := []struct {
		card internal.Card
		want int
	}{
		{internal.Card{Rank: 2}, 2},
		{internal.Card{Rank: 9}, 9},
		{internal.Card{Rank: 10}, 0},
		{internal.Card{Rank: 11}, 0},
		{internal.Card{Rank: 12}, 0},
		{internal.Card{Rank: 13}, 0},
		{internal.Card{Rank: 14}, 0},
	}
	for _, tt := range tests {
		got := CardValue(tt.card)
		if got != tt.want {
			t.Errorf("CardValue(%+v) = %d, want %d", tt.card, got, tt.want)
		}
	}
}

func TestHandSum(t *testing.T) {
	tests := []struct {
		name  string
		cards []internal.Card
		want  int
	}{
		{"two low cards", []internal.Card{{Rank: 2}, {Rank: 3}}, 5},
		{"with face card", []internal.Card{{Rank: 9}, {Rank: 10}}, 9},
		{"wrap around", []internal.Card{{Rank: 9}, {Rank: 8}}, 7},
		{"three cards", []internal.Card{{Rank: 2}, {Rank: 3}, {Rank: 10}}, 5},
		{"all faces", []internal.Card{{Rank: 10}, {Rank: 11}, {Rank: 12}}, 0},
		{"mixed wrap", []internal.Card{{Rank: 7}, {Rank: 8}, {Rank: 9}}, 4},
		{"single card", []internal.Card{{Rank: 5}}, 5},
		{"empty hand", []internal.Card{}, 0},
	}
	for _, tt := range tests {
		got := HandSum(tt.cards)
		if got != tt.want {
			t.Errorf("%s: HandSum(%+v) = %d, want %d", tt.name, tt.cards, got, tt.want)
		}
	}
}

func TestShouldDraw(t *testing.T) {
	tests := []struct {
		name  string
		cards []internal.Card
		want  bool
	}{
		{"sum 0 should draw", []internal.Card{{Rank: 10}, {Rank: 10}}, true},
		{"sum 3 should draw", []internal.Card{{Rank: 3}, {Rank: 10}}, true},
		{"sum 5 should draw", []internal.Card{{Rank: 5}, {Rank: 10}}, true},
		{"sum 6 should stand", []internal.Card{{Rank: 6}, {Rank: 10}}, false},
		{"sum 7 should stand", []internal.Card{{Rank: 7}, {Rank: 10}}, false},
		{"sum 8 should stand", []internal.Card{{Rank: 8}, {Rank: 10}}, false},
		{"sum 9 should stand", []internal.Card{{Rank: 9}, {Rank: 10}}, false},
	}
	for _, tt := range tests {
		got := ShouldDraw(tt.cards)
		if got != tt.want {
			t.Errorf("%s: ShouldDraw(%+v) = %v, want %v", tt.name, tt.cards, got, tt.want)
		}
	}
}

func TestDrawForThird(t *testing.T) {
	tests := []struct {
		name        string
		cards       []internal.Card
		playerThird int
		want        bool
	}{
		{"v=0 always", []internal.Card{{Rank: 10, Suit: internal.Clubs}, {Rank: 10, Suit: internal.Diamonds}}, 0, true},
		{"v=0 always pt=9", []internal.Card{{Rank: 10, Suit: internal.Clubs}, {Rank: 10, Suit: internal.Diamonds}}, 9, true},
		{"v=1 always", []internal.Card{{Rank: 2, Suit: internal.Clubs}, {Rank: 9, Suit: internal.Diamonds}}, 0, true},
		{"v=2 always", []internal.Card{{Rank: 2, Suit: internal.Clubs}, {Rank: 10, Suit: internal.Diamonds}}, 0, true},
		{"v=3 pt=1 draws", []internal.Card{{Rank: 3, Suit: internal.Clubs}, {Rank: 10, Suit: internal.Diamonds}}, 1, true},
		{"v=3 pt=8 stands", []internal.Card{{Rank: 3, Suit: internal.Clubs}, {Rank: 10, Suit: internal.Diamonds}}, 8, false},
		{"v=3 pt=9 draws", []internal.Card{{Rank: 3, Suit: internal.Clubs}, {Rank: 10, Suit: internal.Diamonds}}, 9, true},
		{"v=4 pt=1 stands", []internal.Card{{Rank: 4, Suit: internal.Clubs}, {Rank: 10, Suit: internal.Diamonds}}, 1, false},
		{"v=4 pt=2 draws", []internal.Card{{Rank: 4, Suit: internal.Clubs}, {Rank: 10, Suit: internal.Diamonds}}, 2, true},
		{"v=4 pt=7 draws", []internal.Card{{Rank: 4, Suit: internal.Clubs}, {Rank: 10, Suit: internal.Diamonds}}, 7, true},
		{"v=4 pt=8 stands", []internal.Card{{Rank: 4, Suit: internal.Clubs}, {Rank: 10, Suit: internal.Diamonds}}, 8, false},
		{"v=5 pt=3 stands", []internal.Card{{Rank: 5, Suit: internal.Clubs}, {Rank: 10, Suit: internal.Diamonds}}, 3, false},
		{"v=5 pt=4 draws", []internal.Card{{Rank: 5, Suit: internal.Clubs}, {Rank: 10, Suit: internal.Diamonds}}, 4, true},
		{"v=5 pt=7 draws", []internal.Card{{Rank: 5, Suit: internal.Clubs}, {Rank: 10, Suit: internal.Diamonds}}, 7, true},
		{"v=5 pt=8 stands", []internal.Card{{Rank: 5, Suit: internal.Clubs}, {Rank: 10, Suit: internal.Diamonds}}, 8, false},
		{"v=6 pt=5 stands", []internal.Card{{Rank: 6, Suit: internal.Clubs}, {Rank: 10, Suit: internal.Diamonds}}, 5, false},
		{"v=6 pt=6 draws", []internal.Card{{Rank: 6, Suit: internal.Clubs}, {Rank: 10, Suit: internal.Diamonds}}, 6, true},
		{"v=6 pt=7 draws", []internal.Card{{Rank: 6, Suit: internal.Clubs}, {Rank: 10, Suit: internal.Diamonds}}, 7, true},
		{"v=6 pt=8 stands", []internal.Card{{Rank: 6, Suit: internal.Clubs}, {Rank: 10, Suit: internal.Diamonds}}, 8, false},
		{"v=7 stands", []internal.Card{{Rank: 7, Suit: internal.Clubs}, {Rank: 10, Suit: internal.Diamonds}}, 0, false},
		{"v=8 stands", []internal.Card{{Rank: 8, Suit: internal.Clubs}, {Rank: 10, Suit: internal.Diamonds}}, 0, false},
		{"v=9 stands", []internal.Card{{Rank: 9, Suit: internal.Clubs}, {Rank: 10, Suit: internal.Diamonds}}, 0, false},
	}
	for _, tt := range tests {
		got := DrawForThird(tt.cards, tt.playerThird)
		if got != tt.want {
			t.Errorf("%s: DrawForThird(%+v, %d) = %v, want %v",
				tt.name, tt.cards, tt.playerThird, got, tt.want)
		}
	}
}
