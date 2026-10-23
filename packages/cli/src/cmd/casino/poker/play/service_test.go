package play

import (
	"testing"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/casino/internal"
)

func TestRunPlay(t *testing.T) {
	_ = runPlay
}

func TestDealCards(t *testing.T) {
	deck := []internal.Card{{Rank: 2}, {Rank: 3}, {Rank: 4}}
	cards := dealCards(&deck, 2)
	if len(cards) != 2 {
		t.Errorf("dealCards() returned %d cards, want 2", len(cards))
	}
	if len(deck) != 1 {
		t.Errorf("deck has %d cards left, want 1", len(deck))
	}
}
