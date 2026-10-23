package play

import (
	"strings"
	"testing"

	tea "charm.land/bubbletea/v2"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/casino/internal"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/casino/poker/hand"
)

func TestPokerPlayModel_Init(t *testing.T) {
	m := pokerPlayModel{}
	if cmd := m.Init(); cmd != nil {
		t.Error("Init() should return nil")
	}
}

func TestPokerPlayModel_UpdateQuit(t *testing.T) {
	m := pokerPlayModel{}
	_, cmd := m.Update(tea.KeyPressMsg{Code: 'q'})
	if cmd == nil {
		t.Error("expected quit command on 'q'")
	}
}

func TestPokerPlayModel_UpdateCtrlC(t *testing.T) {
	m := pokerPlayModel{}
	_, cmd := m.Update(tea.KeyPressMsg{Code: 'c', Mod: tea.ModCtrl})
	if cmd == nil {
		t.Error("expected quit command on ctrl+c")
	}
}

func TestAiPreflopStrength(t *testing.T) {
	tests := []struct {
		name  string
		cards []internal.Card
		want  int
	}{
		{"pocket aces", []internal.Card{{Rank: 14, Suit: internal.Spades}, {Rank: 14, Suit: internal.Hearts}}, 8},
		{"pocket eights", []internal.Card{{Rank: 8, Suit: internal.Spades}, {Rank: 8, Suit: internal.Hearts}}, 8},
		{"pocket sevens", []internal.Card{{Rank: 7, Suit: internal.Spades}, {Rank: 7, Suit: internal.Hearts}}, 4},
		{"AK suited", []internal.Card{{Rank: 14, Suit: internal.Spades}, {Rank: 13, Suit: internal.Spades}}, 7},
		{"AK offsuit", []internal.Card{{Rank: 14, Suit: internal.Spades}, {Rank: 13, Suit: internal.Hearts}}, 6},
		{"weak hand", []internal.Card{{Rank: 2, Suit: internal.Spades}, {Rank: 7, Suit: internal.Hearts}}, 1},
	}
	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			got := aiPreflopStrength(tc.cards)
			if got != tc.want {
				t.Errorf("aiPreflopStrength = %d, want %d", got, tc.want)
			}
		})
	}
}

func TestAdvanceStreet(t *testing.T) {
	m := &pokerPlayModel{
		deck:   []internal.Card{{Rank: 2, Suit: internal.Spades}, {Rank: 3, Suit: internal.Hearts}, {Rank: 4, Suit: internal.Clubs}, {Rank: 5, Suit: internal.Diamonds}, {Rank: 6, Suit: internal.Spades}},
		street: streetPreflop,
	}
	m.advanceStreet()
	if m.street != streetFlop {
		t.Errorf("expected streetFlop, got %d", m.street)
	}
	if len(m.board) != 3 {
		t.Errorf("expected 3 board cards on flop, got %d", len(m.board))
	}
	m.advanceStreet()
	if m.street != streetTurn {
		t.Errorf("expected streetTurn, got %d", m.street)
	}
	if len(m.board) != 4 {
		t.Errorf("expected 4 board cards on turn, got %d", len(m.board))
	}
	m.advanceStreet()
	if m.street != streetRiver {
		t.Errorf("expected streetRiver, got %d", m.street)
	}
	m.advanceStreet()
	if m.street != streetShowdown {
		t.Errorf("expected streetShowdown, got %d", m.street)
	}
}

func TestHeroWinsPot(t *testing.T) {
	m := &pokerPlayModel{heroChips: 100, pot: 200}
	m.heroWinsPot()
	if m.heroChips != 300 {
		t.Errorf("expected 300 chips, got %d", m.heroChips)
	}
	if m.street != streetShowdown {
		t.Errorf("expected streetShowdown, got %d", m.street)
	}
}

func TestVillainWinsPot(t *testing.T) {
	m := &pokerPlayModel{villainChips: 100, pot: 200}
	m.villainWinsPot()
	if m.villainChips != 300 {
		t.Errorf("expected 300 chips, got %d", m.villainChips)
	}
	if m.street != streetShowdown {
		t.Errorf("expected streetShowdown, got %d", m.street)
	}
}

func TestPokerPlayModel_ViewShowsTitle(t *testing.T) {
	m := pokerPlayModel{}
	v := m.View()
	if !strings.Contains(v.Content, "TEXAS HOLD'EM") {
		t.Errorf("expected title in view, got %q", v.Content)
	}
}

func TestPokerPlayModel_ViewShowsChips(t *testing.T) {
	m := pokerPlayModel{heroChips: 500, villainChips: 500, pot: 30}
	v := m.View()
	if !strings.Contains(v.Content, "500") {
		t.Errorf("expected chip counts in view, got %q", v.Content)
	}
}

func TestPokerPlayModel_UpdateShowdownEnterRestarts(t *testing.T) {
	m := pokerPlayModel{street: streetShowdown}
	updated, _ := m.Update(tea.KeyPressMsg{Code: tea.KeyEnter})
	m2 := updated.(pokerPlayModel)
	if m2.street != streetPreflop {
		t.Errorf("expected state reset to preflop after enter in showdown, got %d", m2.street)
	}
}

func TestAiEvalStrengthWithEmptyBoard(t *testing.T) {
	hc := []internal.Card{{Rank: 14, Suit: internal.Spades}, {Rank: 14, Suit: internal.Hearts}}
	got := aiEvalStrength(hc, nil)
	if got < 8 {
		t.Errorf("expected strong preflop eval for aces, got %d", got)
	}
}

func TestAiEvalStrengthWithBoard(t *testing.T) {
	hc := []internal.Card{{Rank: 14, Suit: internal.Spades}, {Rank: 13, Suit: internal.Spades}}
	bc := []internal.Card{{Rank: 10, Suit: internal.Spades}, {Rank: 9, Suit: internal.Spades}, {Rank: 2, Suit: internal.Spades}}
	got := aiEvalStrength(hc, bc)
	if got < int(hand.Flush) {
		t.Errorf("expected flush+, got rank %d", got)
	}
}
