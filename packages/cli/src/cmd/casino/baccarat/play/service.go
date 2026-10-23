package play

import (
	tea "charm.land/bubbletea/v2"
)

func runPlay() error {
	m := baccaratModel{balance: 1000, bet: 25, betType: "player", state: baccaratBet}
	_, err := tea.NewProgram(m).Run()
	return err
}
