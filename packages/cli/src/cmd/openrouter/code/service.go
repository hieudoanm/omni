package code

import (
	"log"

	tea "charm.land/bubbletea/v2"
)

func runCode(modelFlag string) error {
	model := modelFlag
	if model == "" {
		model = pickToolModel()
	}
	if _, err := tea.NewProgram(codeInitialModel(model)).Run(); err != nil {
		log.Fatal(err)
	}
	return nil
}
