package code

import (
	"log"

	tea "charm.land/bubbletea/v2"
)

func runCode() error {
	if _, err := tea.NewProgram(codeInitialModel()).Run(); err != nil {
		log.Fatal(err)
	}
	return nil
}
