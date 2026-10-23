package play

import (
	"strings"
	"testing"

	tea "charm.land/bubbletea/v2"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/casino/internal"
)

func TestBaccaratModel_Init(t *testing.T) {
	m := baccaratModel{}
	if cmd := m.Init(); cmd != nil {
		t.Error("Init() should return nil")
	}
}

func TestBaccaratModel_UpdateQuit(t *testing.T) {
	m := baccaratModel{}
	_, cmd := m.Update(tea.KeyPressMsg{Code: 'q'})
	if cmd == nil {
		t.Error("expected quit command on 'q'")
	}
}

func TestBaccaratModel_UpdateCtrlC(t *testing.T) {
	m := baccaratModel{}
	_, cmd := m.Update(tea.KeyPressMsg{Code: 'c', Mod: tea.ModCtrl})
	if cmd == nil {
		t.Error("expected quit command on ctrl+c")
	}
}

func TestBaccaratModel_DealInitialState(t *testing.T) {
	m := baccaratModel{balance: 1000, bet: 25}
	m.betType = "player"
	m.balance -= m.bet
	m.deck = internal.NewShuffledDeck()
	m.deal()
	if len(m.player) == 0 {
		t.Error("expected player cards after deal")
	}
	if len(m.banker) == 0 {
		t.Error("expected banker cards after deal")
	}
	if !m.showCards {
		t.Error("showCards should be true after deal")
	}
}

func TestBaccaratModel_FinishPlayerWins(t *testing.T) {
	m := baccaratModel{
		player:  []internal.Card{{Rank: 8, Suit: internal.Hearts}, {Rank: 9, Suit: internal.Clubs}},
		banker:  []internal.Card{{Rank: 2, Suit: internal.Spades}, {Rank: 3, Suit: internal.Diamonds}},
		bet:     100,
		balance: 0,
		betType: "player",
	}
	m.finish()
	if m.balance != 200 {
		t.Errorf("expected balance 200 after player win, got %d", m.balance)
	}
}

func TestBaccaratModel_FinishBankerWins(t *testing.T) {
	m := baccaratModel{
		player:  []internal.Card{{Rank: 2, Suit: internal.Hearts}, {Rank: 3, Suit: internal.Clubs}},
		banker:  []internal.Card{{Rank: 8, Suit: internal.Spades}, {Rank: 9, Suit: internal.Diamonds}},
		bet:     100,
		balance: 0,
		betType: "banker",
	}
	m.finish()
	if m.balance <= 0 {
		t.Error("expected positive balance after banker win")
	}
}

func TestBaccaratModel_FinishTie(t *testing.T) {
	m := baccaratModel{
		player:  []internal.Card{{Rank: 5, Suit: internal.Hearts}, {Rank: 3, Suit: internal.Clubs}},
		banker:  []internal.Card{{Rank: 5, Suit: internal.Spades}, {Rank: 3, Suit: internal.Diamonds}},
		bet:     100,
		balance: 0,
		betType: "tie",
	}
	m.finish()
	if m.balance != 900 {
		t.Errorf("expected balance 900 for tie win (8:1), got %d", m.balance)
	}
}

func TestBaccaratModel_FinishTieBetReturned(t *testing.T) {
	m := baccaratModel{
		player:  []internal.Card{{Rank: 5, Suit: internal.Hearts}, {Rank: 3, Suit: internal.Clubs}},
		banker:  []internal.Card{{Rank: 5, Suit: internal.Spades}, {Rank: 3, Suit: internal.Diamonds}},
		bet:     100,
		balance: 0,
		betType: "player",
	}
	m.finish()
	if m.balance != 100 {
		t.Errorf("expected balance 100 for tie with returned bet, got %d", m.balance)
	}
}

func TestBaccaratModel_FinishLose(t *testing.T) {
	m := baccaratModel{
		player:  []internal.Card{{Rank: 2, Suit: internal.Hearts}, {Rank: 3, Suit: internal.Clubs}},
		banker:  []internal.Card{{Rank: 8, Suit: internal.Spades}, {Rank: 9, Suit: internal.Diamonds}},
		bet:     100,
		balance: 0,
		betType: "player",
	}
	m.finish()
	if m.balance != 0 {
		t.Errorf("expected balance 0 after loss, got %d", m.balance)
	}
	if !strings.Contains(m.result, "lose") {
		t.Errorf("expected result to mention lose, got %q", m.result)
	}
}

func TestBaccaratModel_ViewShowsTitle(t *testing.T) {
	m := baccaratModel{}
	v := m.View()
	if !strings.Contains(v.Content, "Baccarat") {
		t.Errorf("expected Baccarat in view, got %q", v.Content)
	}
}

func TestBaccaratModel_ViewShowsBalance(t *testing.T) {
	m := baccaratModel{balance: 500, state: baccaratBet}
	v := m.View()
	if !strings.Contains(v.Content, "500") {
		t.Errorf("expected balance 500 in view, got %q", v.Content)
	}
}

func TestBaccaratModel_ViewShowsResult(t *testing.T) {
	m := baccaratModel{state: baccaratResult, result: "You win!"}
	v := m.View()
	if !strings.Contains(v.Content, "You win") {
		t.Errorf("expected result in view, got %q", v.Content)
	}
}

func TestBaccaratModel_UpdateEnterBetTransitions(t *testing.T) {
	m := baccaratModel{balance: 100, bet: 25, betType: "player", state: baccaratBet}
	updated, _ := m.Update(tea.KeyPressMsg{Code: tea.KeyEnter})
	m2 := updated.(baccaratModel)
	if m2.state != baccaratResult {
		t.Errorf("expected state baccaratResult after entering bet, got %d", m2.state)
	}
}

func TestBaccaratModel_UpdateAdjustBet(t *testing.T) {
	m := baccaratModel{balance: 100, bet: 25, state: baccaratBet}
	updated, _ := m.Update(tea.KeyPressMsg{Code: tea.KeyUp})
	m2 := updated.(baccaratModel)
	if m2.bet != 50 {
		t.Errorf("expected bet 50 after up, got %d", m2.bet)
	}
}
