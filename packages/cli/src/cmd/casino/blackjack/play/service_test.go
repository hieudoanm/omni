package play

import (
	"strings"
	"testing"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/casino/internal"
)

func TestBjValue(t *testing.T) {
	tests := []struct {
		card internal.Card
		want int
	}{
		{internal.Card{Rank: 2}, 2},
		{internal.Card{Rank: 10}, 10},
		{internal.Card{Rank: 11}, 10},
		{internal.Card{Rank: 12}, 10},
		{internal.Card{Rank: 13}, 10},
		{internal.Card{Rank: 14}, 11},
	}
	for _, tt := range tests {
		got := bjValue(tt.card)
		if got != tt.want {
			t.Errorf("bjValue(%+v) = %d, want %d", tt.card, got, tt.want)
		}
	}
}

func TestHandValue(t *testing.T) {
	tests := []struct {
		name  string
		cards []internal.Card
		want  int
	}{
		{"two low cards", []internal.Card{{Rank: 2}, {Rank: 3}}, 5},
		{"face cards", []internal.Card{{Rank: 11}, {Rank: 12}}, 20},
		{"soft ace", []internal.Card{{Rank: 14}, {Rank: 5}}, 16},
		{"blackjack", []internal.Card{{Rank: 14}, {Rank: 10}}, 21},
		{"two aces", []internal.Card{{Rank: 14}, {Rank: 14}}, 12},
		{"three aces", []internal.Card{{Rank: 14}, {Rank: 14}, {Rank: 14}}, 13},
		{"ace + face + low", []internal.Card{{Rank: 14}, {Rank: 10}, {Rank: 5}}, 16},
		{"two aces + 9", []internal.Card{{Rank: 14}, {Rank: 14}, {Rank: 9}}, 21},
		{"four aces", []internal.Card{{Rank: 14}, {Rank: 14}, {Rank: 14}, {Rank: 14}}, 14},
		{"bust", []internal.Card{{Rank: 10}, {Rank: 10}, {Rank: 5}}, 25},
		{"exactly 21", []internal.Card{{Rank: 10}, {Rank: 7}, {Rank: 4}}, 21},
		{"single card", []internal.Card{{Rank: 7}}, 7},
		{"empty hand", []internal.Card{}, 0},
	}
	for _, tt := range tests {
		got := handValue(tt.cards)
		if got != tt.want {
			t.Errorf("%s: handValue(%+v) = %d, want %d", tt.name, tt.cards, got, tt.want)
		}
	}
}

func TestHandValueAceAdjustment(t *testing.T) {
	cards := []internal.Card{
		{Rank: 14, Suit: internal.Clubs},
		{Rank: 14, Suit: internal.Diamonds},
		{Rank: 14, Suit: internal.Hearts},
	}
	got := handValue(cards)
	if got != 13 {
		t.Errorf("three aces: handValue = %d, want 13", got)
	}
}

func TestCardFace(t *testing.T) {
	tests := []struct {
		card internal.Card
		want string
	}{
		{internal.Card{Rank: 2, Suit: internal.Clubs}, func() string {
			rank := strings.TrimSpace("  2  3  4  5  6  7  8  9 10  J  Q  K  A"[0:2])
			return rank + "♣"
		}()},
		{internal.Card{Rank: 3, Suit: internal.Diamonds}, func() string {
			rank := strings.TrimSpace("  2  3  4  5  6  7  8  9 10  J  Q  K  A"[2:4])
			return rank + "♦"
		}()},
		{internal.Card{Rank: 12, Suit: internal.Hearts}, func() string {
			rank := strings.TrimSpace("  2  3  4  5  6  7  8  9 10  J  Q  K  A"[20:22])
			return rank + "♥"
		}()},
		{internal.Card{Rank: 14, Suit: internal.Spades}, func() string {
			rank := strings.TrimSpace("  2  3  4  5  6  7  8  9 10  J  Q  K  A"[24:26])
			return rank + "♠"
		}()},
	}
	for _, tt := range tests {
		got := cardFace(tt.card)
		if got != tt.want {
			t.Errorf("cardFace(%+v) = %q, want %q", tt.card, got, tt.want)
		}
	}
}

func TestCardFaceSuitSymbols(t *testing.T) {
	gotC := cardFace(internal.Card{Rank: 5, Suit: internal.Clubs})
	if !strings.Contains(gotC, "♣") {
		t.Errorf("cardFace(Clubs) = %q, expected ♣", gotC)
	}
	gotD := cardFace(internal.Card{Rank: 5, Suit: internal.Diamonds})
	if !strings.Contains(gotD, "♦") {
		t.Errorf("cardFace(Diamonds) = %q, expected ♦", gotD)
	}
	gotH := cardFace(internal.Card{Rank: 5, Suit: internal.Hearts})
	if !strings.Contains(gotH, "♥") {
		t.Errorf("cardFace(Hearts) = %q, expected ♥", gotH)
	}
	gotS := cardFace(internal.Card{Rank: 5, Suit: internal.Spades})
	if !strings.Contains(gotS, "♠") {
		t.Errorf("cardFace(Spades) = %q, expected ♠", gotS)
	}
}

func TestRenderCardsNoHide(t *testing.T) {
	cards := []internal.Card{
		{Rank: 5, Suit: internal.Clubs},
		{Rank: 10, Suit: internal.Diamonds},
	}
	result := renderCards(cards, false)
	if !strings.Contains(result, "♣") || !strings.Contains(result, "♦") {
		t.Errorf("renderCards(no hide) = %q, missing suit symbols", result)
	}
}

func TestRenderCardsHideFirst(t *testing.T) {
	cards := []internal.Card{
		{Rank: 5, Suit: internal.Clubs},
		{Rank: 10, Suit: internal.Diamonds},
	}
	result := renderCards(cards, true)
	if !strings.Contains(result, "🂠") {
		t.Errorf("renderCards(hide first) = %q, expected hidden card symbol", result)
	}
	if !strings.Contains(result, "♦") {
		t.Errorf("renderCards(hide first) = %q, missing second card suit", result)
	}
}

func TestRenderCardsEmpty(t *testing.T) {
	renderCards([]internal.Card{}, false)
}

func TestRenderCardsNoHideShowsAll(t *testing.T) {
	cards := []internal.Card{
		{Rank: 2, Suit: internal.Clubs},
		{Rank: 3, Suit: internal.Diamonds},
	}
	result := renderCards(cards, false)
	if strings.Contains(result, "🂠") {
		t.Errorf("renderCards(hide=false) should not contain hidden card, got %q", result)
	}
}
