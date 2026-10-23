package internal

import (
	"github.com/AlecAivazis/survey/v2"
)

func ResolveDOI(args []string) (string, error) {
	if len(args) > 0 {
		return args[0], nil
	}
	var id string
	prompt := &survey.Input{Message: "DOI ID:"}
	if err := survey.AskOne(prompt, &id); err != nil {
		return "", err
	}
	return id, nil
}
