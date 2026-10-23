package odds

import (
	"testing"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/casino/internal"
)

func TestNewPokerDeckSize(t *testing.T) {
	deck := newPokerDeck()
	if len(deck) != 52 {
		t.Fatalf("newPokerDeck() returned %d cards, want 52", len(deck))
	}
}

func TestNewPokerDeckUniqueness(t *testing.T) {
	deck := newPokerDeck()
	seen := map[internal.Card]int{}
	for _, c := range deck {
		seen[c]++
	}
	if len(seen) != 52 {
		t.Errorf("newPokerDeck() has %d unique cards, want 52", len(seen))
	}
	for c, n := range seen {
		if n != 1 {
			t.Errorf("card %v appears %d times", c, n)
		}
	}
}

func TestNewPokerDeckAllRanksSuits(t *testing.T) {
	deck := newPokerDeck()
	has := map[internal.Card]bool{}
	for _, c := range deck {
		has[c] = true
	}
	for rank := 2; rank <= 14; rank++ {
		for suit := 0; suit < 4; suit++ {
			c := internal.Card{Rank: rank, Suit: internal.Suit(suit)}
			if !has[c] {
				t.Errorf("newPokerDeck() missing card %v", c)
			}
		}
	}
}

func TestRemoveCards(t *testing.T) {
	deck := newPokerDeck()
	remove := map[internal.Card]bool{
		{Rank: 2, Suit: internal.Clubs}:   true,
		{Rank: 14, Suit: internal.Spades}: true,
	}
	result := removeCards(deck, remove)
	if len(result) != 50 {
		t.Errorf("removeCards() returned %d cards, want 50", len(result))
	}
	for _, c := range result {
		if remove[c] {
			t.Errorf("removeCards() should have removed %v but found it", c)
		}
	}
}

func TestRemoveCardsNoRemovals(t *testing.T) {
	deck := newPokerDeck()
	result := removeCards(deck, map[internal.Card]bool{})
	if len(result) != 52 {
		t.Errorf("removeCards(empty) returned %d cards, want 52", len(result))
	}
}

func TestToCardMap(t *testing.T) {
	cards := []internal.Card{{Rank: 2, Suit: internal.Clubs}, {Rank: 14, Suit: internal.Spades}, {Rank: 7, Suit: internal.Diamonds}}
	m := toCardMap(cards)
	if len(m) != 3 {
		t.Errorf("toCardMap() returned %d entries, want 3", len(m))
	}
	for _, c := range cards {
		if !m[c] {
			t.Errorf("toCardMap() missing %v", c)
		}
	}
}

func TestToCardMapEmpty(t *testing.T) {
	m := toCardMap([]internal.Card{})
	if len(m) != 0 {
		t.Errorf("toCardMap(empty) returned %d entries, want 0", len(m))
	}
}

func TestFormatCards(t *testing.T) {
	result, err := FormatCards("Ah Kd")
	if err != nil {
		t.Fatalf("FormatCards(\"Ah Kd\") unexpected error: %v", err)
	}
	if len(result) != 2 {
		t.Fatalf("FormatCards() returned %d cards, want 2", len(result))
	}
	want := []internal.Card{{Rank: 14, Suit: internal.Hearts}, {Rank: 13, Suit: internal.Diamonds}}
	for i := range want {
		if result[i] != want[i] {
			t.Errorf("result[%d] = %v, want %v", i, result[i], want[i])
		}
	}
}

func TestFormatCardsSortsByRankThenSuit(t *testing.T) {
	result, err := FormatCards("As Ac")
	if err != nil {
		t.Fatalf("FormatCards(\"As Ac\") unexpected error: %v", err)
	}
	if len(result) != 2 {
		t.Fatalf("FormatCards() returned %d cards, want 2", len(result))
	}
	want := []internal.Card{{Rank: 14, Suit: internal.Clubs}, {Rank: 14, Suit: internal.Spades}}
	for i := range want {
		if result[i] != want[i] {
			t.Errorf("result[%d] = %v, want %v", i, result[i], want[i])
		}
	}
}

func TestFormatCardsSingle(t *testing.T) {
	result, err := FormatCards("2c")
	if err != nil {
		t.Fatalf("FormatCards(\"2c\") unexpected error: %v", err)
	}
	if len(result) != 1 {
		t.Fatalf("FormatCards() returned %d cards, want 1", len(result))
	}
	if result[0] != (internal.Card{Rank: 2, Suit: internal.Clubs}) {
		t.Errorf("FormatCards(\"2c\") = %v, want {2 Clubs}", result[0])
	}
}

func TestFormatCardsInvalidShort(t *testing.T) {
	_, err := FormatCards("A")
	if err == nil {
		t.Error("FormatCards(\"A\") expected error, got nil")
	}
}

func TestFormatCardsEmpty(t *testing.T) {
	result, err := FormatCards("")
	if err != nil {
		t.Fatalf("FormatCards(\"\") unexpected error: %v", err)
	}
	if len(result) != 0 {
		t.Errorf("FormatCards(\"\") returned %d cards, want 0", len(result))
	}
}

func TestFormatCardsMultipleSpaces(t *testing.T) {
	result, err := FormatCards("  Ah  Kd  ")
	if err != nil {
		t.Fatalf("FormatCards(\"  Ah  Kd  \") unexpected error: %v", err)
	}
	if len(result) != 2 {
		t.Fatalf("FormatCards() returned %d cards, want 2", len(result))
	}
}
