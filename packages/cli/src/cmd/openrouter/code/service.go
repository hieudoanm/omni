package code

import (
	tea "charm.land/bubbletea/v2"
)

func runCode(modelFlag string) error {
	model := modelFlag
	if model == "" {
		model = pickToolModel()
	}
	_, err := tea.NewProgram(codeInitialModel(model)).Run()
	return err
}
