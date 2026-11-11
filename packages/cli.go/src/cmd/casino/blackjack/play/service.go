package play

import (
	tea "charm.land/bubbletea/v2"
)

func runPlay() error {
	m := playModel{balance: 1000, bet: 25}
	_, err := tea.NewProgram(m).Run()
	return err
}
