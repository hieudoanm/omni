package play

import (
	tea "charm.land/bubbletea/v2"
)

func runPlay() error {
	m := pokerPlayModel{
		heroChips:    1000,
		villainChips: 1000,
		street:       streetPreflop,
	}
	_, err := tea.NewProgram(m).Run()
	return err
}
