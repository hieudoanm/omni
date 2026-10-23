package play

import (
	"fmt"
	"strings"

	tea "charm.land/bubbletea/v2"
	"charm.land/lipgloss/v2"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/casino/baccarat/rules"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/casino/internal"
)

type baccaratState int

const (
	baccaratBet baccaratState = iota
	baccaratDeal
	baccaratResult
)

type baccaratModel struct {
	deck      []internal.Card
	player    []internal.Card
	banker    []internal.Card
	balance   int
	bet       int
	betType   string
	state     baccaratState
	message   string
	result    string
	pValue    int
	bValue    int
	showCards bool
}

func (m *baccaratModel) deal() {
	m.player = []internal.Card{m.deck[0], m.deck[1]}
	m.banker = []internal.Card{m.deck[2], m.deck[3]}
	m.deck = m.deck[4:]

	m.pValue = rules.HandSum(m.player)
	m.bValue = rules.HandSum(m.banker)

	m.showCards = true

	if m.pValue >= 8 || m.bValue >= 8 {
		m.finish()
		return
	}

	if rules.ShouldDraw(m.player) {
		m.player = append(m.player, m.deck[0])
		m.deck = m.deck[1:]
		m.pValue = rules.HandSum(m.player)
		pc := m.player[2]
		pVal := rules.CardValue(pc)
		if rules.DrawForThird(m.banker, pVal) {
			m.banker = append(m.banker, m.deck[0])
			m.deck = m.deck[1:]
			m.bValue = rules.HandSum(m.banker)
		}
	} else {
		if rules.ShouldDraw(m.banker) {
			m.banker = append(m.banker, m.deck[0])
			m.deck = m.deck[1:]
			m.bValue = rules.HandSum(m.banker)
		}
	}

	m.finish()
}

func (m *baccaratModel) finish() {
	pv := rules.HandSum(m.player)
	bv := rules.HandSum(m.banker)

	m.pValue = pv
	m.bValue = bv

	switch {
	case pv > bv && m.betType == "player":
		m.balance += m.bet * 2
		m.result = "Player wins! You win $" + fmt.Sprint(m.bet)
	case bv > pv && m.betType == "banker":
		win := m.bet + m.bet*95/100
		m.balance += win
		m.result = fmt.Sprintf("Banker wins! You win $%d (5%% commission)", m.bet*95/100)
	case pv == bv && m.betType == "tie":
		m.balance += m.bet * 9
		m.result = "Tie! You win 8:1, $" + fmt.Sprint(m.bet*8)
	case pv == bv:
		m.balance += m.bet
		m.result = "Tie. Bet returned."
	default:
		m.result = "You lose $" + fmt.Sprint(m.bet)
	}
}

func (m baccaratModel) Init() tea.Cmd {
	return nil
}

func (m baccaratModel) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	switch msg := msg.(type) {
	case tea.KeyMsg:
		switch msg.String() {
		case "q", "ctrl+c":
			return m, tea.Quit
		}

		switch m.state {
		case baccaratBet:
			switch msg.String() {
			case "up":
				m.bet = internal.MinInt(m.bet+25, m.balance)
			case "down":
				if m.bet >= 25 {
					m.bet -= 25
				}
			case "left":
				m.betType = "banker"
			case "right":
				m.betType = "player"
			case "t":
				m.betType = "tie"
			case "enter":
				if m.bet > 0 && m.bet <= m.balance && m.betType != "" {
					m.balance -= m.bet
					m.deck = internal.NewShuffledDeck()
					m.deal()
					m.state = baccaratResult
				}
			}

		case baccaratResult:
			switch msg.String() {
			case "enter":
				m.bet = 25
				m.result = ""
				m.message = ""
				m.state = baccaratBet
				if m.balance <= 0 {
					m.balance = 1000
				}
			}
		}
	}
	return m, nil
}

func (m baccaratModel) View() tea.View {
	title := lipgloss.NewStyle().Bold(true).Foreground(lipgloss.Color("212"))
	gold := lipgloss.NewStyle().Bold(true).Foreground(lipgloss.Color("220"))
	green := lipgloss.NewStyle().Foreground(lipgloss.Color("42"))
	red := lipgloss.NewStyle().Foreground(lipgloss.Color("196"))

	var s string
	s += title.Render("🃏 Baccarat\n\n")

	switch m.state {
	case baccaratBet:
		s += fmt.Sprintf("Balance: %s\n\n", gold.Render(fmt.Sprintf("$%d", m.balance)))
		s += fmt.Sprintf("Bet: %s\n\n", gold.Render(fmt.Sprintf("$%d", m.bet)))
		bt := m.betType
		if bt == "" {
			bt = "—"
		}
		s += fmt.Sprintf("Bet on: [Player] ◄ %s ► [Banker]   [T] Tie\n\n", bt)
		s += "← → select side  •  ↑ ↓ bet  •  T tie  •  Enter deal  •  q quit\n"

	case baccaratResult:
		pc := internal.CardsDisplay(m.player)
		bc := internal.CardsDisplay(m.banker)
		s += fmt.Sprintf("Balance: %s      Bet: %s\n\n", gold.Render(fmt.Sprintf("$%d", m.balance)), gold.Render(fmt.Sprintf("$%d", m.bet)))
		s += fmt.Sprintf("Player: %s  (%d)\n", pc, m.pValue)
		s += fmt.Sprintf("Banker: %s  (%d)\n\n", bc, m.bValue)
		if strings.Contains(m.result, "win") && !strings.Contains(m.result, "lose") {
			s += green.Render("  " + m.result + "\n\n")
		} else if strings.Contains(m.result, "lose") {
			s += red.Render("  " + m.result + "\n\n")
		} else {
			s += lipgloss.NewStyle().Foreground(lipgloss.Color("227")).Render("  " + m.result + "\n\n")
		}
		s += "Enter to continue  •  q to quit\n"
	}

	return tea.NewView(s)
}
