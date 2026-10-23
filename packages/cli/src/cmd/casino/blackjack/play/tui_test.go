package play

import (
	"strings"
	"testing"

	tea "charm.land/bubbletea/v2"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/casino/internal"
)

func TestPlayModel_Init(t *testing.T) {
	m := playModel{}
	if cmd := m.Init(); cmd != nil {
		t.Error("Init() should return nil")
	}
}

func TestPlayModel_UpdateQuit(t *testing.T) {
	m := playModel{}
	_, cmd := m.Update(tea.KeyPressMsg{Code: 'q'})
	if cmd == nil {
		t.Error("expected quit command on 'q'")
	}
}

func TestPlayModel_UpdateCtrlC(t *testing.T) {
	m := playModel{}
	_, cmd := m.Update(tea.KeyPressMsg{Code: 'c', Mod: tea.ModCtrl})
	if cmd == nil {
		t.Error("expected quit command on ctrl+c")
	}
}

func TestRenderCards(t *testing.T) {
	cards := []internal.Card{{Rank: 2, Suit: internal.Hearts}, {Rank: 13, Suit: internal.Spades}}
	hidden := renderCards(cards, true)
	if !strings.Contains(hidden, "🂠") {
		t.Errorf("expected hidden card symbol for first card, got %q", hidden)
	}
}

func TestRunDealer(t *testing.T) {
	m := &playModel{
		dealer: []internal.Card{{Rank: 2, Suit: internal.Hearts}, {Rank: 3, Suit: internal.Clubs}},
		deck:   []internal.Card{{Rank: 10, Suit: internal.Spades}, {Rank: 5, Suit: internal.Diamonds}},
	}
	runDealer(m)
	if handValue(m.dealer) < 17 {
		t.Errorf("dealer should stand at 17+, got %d", handValue(m.dealer))
	}
}

func TestSettleBetPlayerWins(t *testing.T) {
	m := &playModel{
		player:  []internal.Card{{Rank: 10, Suit: internal.Hearts}, {Rank: 9, Suit: internal.Clubs}},
		dealer:  []internal.Card{{Rank: 10, Suit: internal.Spades}, {Rank: 6, Suit: internal.Diamonds}},
		balance: 0,
		bet:     100,
	}
	settleBet(m)
	if m.balance != 200 {
		t.Errorf("expected balance 200 after win, got %d", m.balance)
	}
	if !strings.Contains(m.message, "win") {
		t.Errorf("expected win message, got %q", m.message)
	}
}

func TestSettleBetPush(t *testing.T) {
	m := &playModel{
		player:  []internal.Card{{Rank: 10, Suit: internal.Hearts}, {Rank: 7, Suit: internal.Clubs}},
		dealer:  []internal.Card{{Rank: 10, Suit: internal.Spades}, {Rank: 7, Suit: internal.Diamonds}},
		balance: 100,
		bet:     100,
	}
	settleBet(m)
	if m.balance != 200 {
		t.Errorf("expected balance 200 after push (bet returned), got %d", m.balance)
	}
	if !strings.Contains(m.message, "Push") {
		t.Errorf("expected push message, got %q", m.message)
	}
}

func TestSettleBetDealerWins(t *testing.T) {
	m := &playModel{
		player:  []internal.Card{{Rank: 10, Suit: internal.Hearts}, {Rank: 5, Suit: internal.Clubs}},
		dealer:  []internal.Card{{Rank: 10, Suit: internal.Spades}, {Rank: 9, Suit: internal.Diamonds}},
		balance: 100,
		bet:     100,
	}
	settleBet(m)
	if m.balance != 100 {
		t.Errorf("expected balance unchanged after loss, got %d", m.balance)
	}
	if !strings.Contains(m.message, "wins") {
		t.Errorf("expected dealer wins message, got %q", m.message)
	}
}

func TestPlayModel_UpdateEnterBetTransitions(t *testing.T) {
	m := playModel{balance: 100, bet: 25, state: playBet}
	updated, _ := m.Update(tea.KeyPressMsg{Code: tea.KeyEnter})
	m2 := updated.(playModel)
	if m2.state == playBet {
		t.Error("state should transition after entering bet")
	}
}

func TestPlayModel_ViewShowsTitle(t *testing.T) {
	m := playModel{}
	v := m.View()
	if !strings.Contains(v.Content, "Blackjack") {
		t.Errorf("expected Blackjack in view, got %q", v.Content)
	}
}

func TestPlayModel_ViewShowsResult(t *testing.T) {
	m := playModel{state: playResult, message: "You win!"}
	v := m.View()
	if !strings.Contains(v.Content, "You win") {
		t.Errorf("expected result in view, got %q", v.Content)
	}
}
