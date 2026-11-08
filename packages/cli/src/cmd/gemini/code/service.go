package code

import (
	tea "charm.land/bubbletea/v2"
)

func runCode() error {
	_, err := tea.NewProgram(codeInitialModel()).Run()
	return err
}
