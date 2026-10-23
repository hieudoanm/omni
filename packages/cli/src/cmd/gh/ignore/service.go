package ignore

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"

	"github.com/AlecAivazis/survey/v2"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/gh/shared"
	requests "github.com/hieudoanm/omni/packages/cli/src/libs/requests"
)

type gitignoreTemplate struct {
	Name   string `json:"name"`
	Source string `json:"source"`
}

func runIgnore(name, output string, jsonOutput bool) error {
	if jsonOutput {
		if name == "" {
			return fmt.Errorf("--name is required for JSON output")
		}
		url := fmt.Sprintf("https://api.github.com/gitignore/templates/%s", name)
		detailBody, err := shared.FetchFuncDefault(url, requests.Options{
			Header: http.Header{
				"Accept":     {"application/json"},
				"User-Agent": {"omni-cli"},
			},
		})
		if err != nil {
			return fmt.Errorf("error fetching template: %w", err)
		}
		var tmpl gitignoreTemplate
		if err := json.Unmarshal(detailBody, &tmpl); err != nil {
			return fmt.Errorf("error parsing response: %w", err)
		}
		out, _ := json.MarshalIndent(map[string]interface{}{
			"content": tmpl.Source,
		}, "", "  ")
		fmt.Println(string(out))
		return nil
	}

	return fetchIgnore(name, output, shared.FetchFuncDefault)
}

func fetchIgnore(name, output string, fetch shared.FetchFunc) error {
	body, err := fetch("https://api.github.com/gitignore/templates", requests.Options{
		Header: http.Header{
			"Accept":     {"application/json"},
			"User-Agent": {"omni-cli"},
		},
	})
	if err != nil {
		return fmt.Errorf("error fetching templates: %w", err)
	}

	var templates []string
	if err := json.Unmarshal(body, &templates); err != nil {
		return fmt.Errorf("error parsing response: %w", err)
	}

	selectedName := name
	if selectedName == "" {
		prompt := &survey.Select{
			Message: "Select a .gitignore template:",
			Options: templates,
		}
		if err := survey.AskOne(prompt, &selectedName); err != nil {
			return fmt.Errorf("selection cancelled: %w", err)
		}
	}

	url := fmt.Sprintf("https://api.github.com/gitignore/templates/%s", selectedName)
	detailBody, err := fetch(url, requests.Options{
		Header: http.Header{
			"Accept":     {"application/json"},
			"User-Agent": {"omni-cli"},
		},
	})
	if err != nil {
		return fmt.Errorf("error fetching template: %w", err)
	}

	var tmpl gitignoreTemplate
	if err := json.Unmarshal(detailBody, &tmpl); err != nil {
		return fmt.Errorf("error parsing response: %w", err)
	}

	file, err := os.Create(output)
	if err != nil {
		return fmt.Errorf("error creating file: %w", err)
	}
	defer file.Close()

	if _, err := file.WriteString(tmpl.Source); err != nil {
		return fmt.Errorf("error writing file: %w", err)
	}

	fmt.Printf("Written %s .gitignore template to %s\n", selectedName, output)
	return nil
}
