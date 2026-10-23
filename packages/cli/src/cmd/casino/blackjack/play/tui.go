package play

import (
	"fmt"
	"strings"

	tea "charm.land/bubbletea/v2"
	"charm.land/lipgloss/v2"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/casino/internal"
)

type playState int

const (
	playBet playState = iota
	playPlayer
	playDealer
	playResult
)

type playModel struct {
	deck    []internal.Card
	player  []internal.Card
	dealer  []internal.Card
	balance int
	bet     int
	state   playState
	message string
}

func bjValue(c internal.Card) int {
	if c.Rank >= 11 && c.Rank <= 13 {
		return 10
	}
	if c.Rank == 14 {
		return 11
	}
	return c.Rank
}

func handValue(cards []internal.Card) int {
	var val int
	var aces int
	for _, c := range cards {
		v := bjValue(c)
		if c.Rank == 14 {
			aces++
		}
		val += v
	}
	for aces > 0 && val > 21 {
		val -= 10
		aces--
	}
	return val
}

func cardFace(c internal.Card) string {
	r := "  2  3  4  5  6  7  8  9 10  J  Q  K  A"
	idx := (c.Rank - 2) * 2
	rank := r[idx : idx+2]
	var sym string
	switch c.Suit {
	case internal.Clubs:
		sym = "♣"
	case internal.Diamonds:
		sym = "♦"
	case internal.Hearts:
		sym = "♥"
	case internal.Spades:
		sym = "♠"
	}
	return strings.TrimSpace(rank) + sym
}

func renderCards(cards []internal.Card, hide bool) string {
	var faces []string
	for i, c := range cards {
		if hide && i == 0 {
			faces = append(faces, "🂠")
		} else {
			faces = append(faces, cardFace(c))
		}
	}
	return lipgloss.NewStyle().Render(strings.Join(faces, " "))
}

func (m playModel) Init() tea.Cmd { return nil }

func runDealer(m *playModel) {
	for handValue(m.dealer) < 17 {
		m.dealer = append(m.dealer, internal.DealCard(&m.deck))
	}
}

func settleBet(m *playModel) {
	pv := handValue(m.player)
	dv := handValue(m.dealer)
	switch {
	case dv > 21 || pv > dv:
		m.balance += m.bet * 2
		m.message = "You win!"
	case pv == dv:
		m.balance += m.bet
		m.message = "Push."
	default:
		m.message = "Dealer wins."
	}
}

func (m playModel) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	switch msg := msg.(type) {
	case tea.KeyMsg:
		switch m.state {
		case playBet:
			switch msg.String() {
			case "up", "right":
				m.bet = internal.MinInt(m.bet+25, m.balance)
			case "down", "left":
				if m.bet >= 25 {
					m.bet -= 25
				}
			case "enter":
				if m.bet > 0 && m.bet <= m.balance {
					m.balance -= m.bet
					m.deck = internal.NewShuffledDeck()
					m.player = []internal.Card{internal.DealCard(&m.deck), internal.DealCard(&m.deck)}
					m.dealer = []internal.Card{internal.DealCard(&m.deck), internal.DealCard(&m.deck)}
					pv := handValue(m.player)
					dv := handValue(m.dealer)
					if pv == 21 && dv == 21 {
						m.balance += m.bet
						m.message = "Push! Both have blackjack."
						m.state = playResult
					} else if pv == 21 {
						m.balance += int(float64(m.bet) * 2.5)
						m.message = "Blackjack! You win 3:2!"
						m.state = playResult
					} else if dv == 21 {
						m.message = "Dealer has blackjack. You lose."
						m.state = playResult
					} else {
						m.state = playPlayer
					}
				}
			case "q", "ctrl+c":
				return m, tea.Quit
			}

		case playPlayer:
			switch msg.String() {
			case "h":
				m.player = append(m.player, internal.DealCard(&m.deck))
				if handValue(m.player) > 21 {
					m.message = "Bust! You lose."
					m.state = playResult
				}
			case "s":
				runDealer(&m)
				settleBet(&m)
				m.state = playResult
			case "d":
				if len(m.player) == 2 {
					m.balance -= m.bet
					m.bet *= 2
					m.player = append(m.player, internal.DealCard(&m.deck))
					if handValue(m.player) > 21 {
						m.message = "Bust! You lose."
						m.state = playResult
					} else {
						runDealer(&m)
						settleBet(&m)
						m.state = playResult
					}
				}
			case "q", "ctrl+c":
				return m, tea.Quit
			}

		case playResult:
			switch msg.String() {
			case "enter":
				m.bet = 25
				m.message = ""
				m.state = playBet
				if m.balance <= 0 {
					m.balance = 1000
				}
			case "q", "ctrl+c":
				return m, tea.Quit
			}
		}
	}
	return m, nil
}

func (m playModel) View() tea.View {
	var s string
	title := lipgloss.NewStyle().Bold(true).Foreground(lipgloss.Color("212"))
	green := lipgloss.NewStyle().Foreground(lipgloss.Color("42"))
	red := lipgloss.NewStyle().Foreground(lipgloss.Color("196"))
	gold := lipgloss.NewStyle().Bold(true).Foreground(lipgloss.Color("220"))

	s += title.Render("🃏 Blackjack\n\n")

	switch m.state {
	case playBet:
		s += fmt.Sprintf("Balance: %s\n\n", gold.Render(fmt.Sprintf("$%d", m.balance)))
		s += fmt.Sprintf("Bet: %s\n\n", gold.Render(fmt.Sprintf("$%d", m.bet)))
		s += "← → adjust bet  •  Enter to deal  •  q to quit\n"

	case playPlayer, playDealer:
		s += fmt.Sprintf("Balance: %s      Bet: %s\n\n", gold.Render(fmt.Sprintf("$%d", m.balance)), gold.Render(fmt.Sprintf("$%d", m.bet)))
		s += fmt.Sprintf("Dealer: %s  (%d)\n", renderCards(m.dealer, true), handValue(m.dealer[1:]))
		s += fmt.Sprintf("Player: %s  (%d)\n\n", renderCards(m.player, false), handValue(m.player))
		if m.state == playPlayer {
			s += lipgloss.NewStyle().Foreground(lipgloss.Color("51")).Render("[h] Hit  [s] Stand  [d] Double  [q] Quit")
		}

	case playResult:
		s += fmt.Sprintf("Balance: %s      Bet: %s\n\n", gold.Render(fmt.Sprintf("$%d", m.balance)), gold.Render(fmt.Sprintf("$%d", m.bet)))
		s += fmt.Sprintf("Dealer: %s  (%d)\n", renderCards(m.dealer, false), handValue(m.dealer))
		s += fmt.Sprintf("Player: %s  (%d)\n\n", renderCards(m.player, false), handValue(m.player))
		if strings.Contains(m.message, "win") {
			s += green.Render("  " + m.message + "\n\n")
		} else if strings.Contains(m.message, "Bust") || strings.Contains(m.message, "lose") || strings.Contains(m.message, "wins") {
			s += red.Render("  " + m.message + "\n\n")
		} else {
			s += lipgloss.NewStyle().Foreground(lipgloss.Color("227")).Render("  " + m.message + "\n\n")
		}
		s += "Enter to continue  •  q to quit\n"
	}

	return tea.NewView(s)
}
