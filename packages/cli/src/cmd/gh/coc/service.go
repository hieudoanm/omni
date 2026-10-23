package coc

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"

	"github.com/AlecAivazis/survey/v2"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/gh/shared"
	requests "github.com/hieudoanm/omni/packages/cli/src/libs/requests"
)

type codeOfConduct struct {
	Key  string `json:"key"`
	Name string `json:"name"`
	URL  string `json:"url"`
	Body string `json:"body"`
}

func runCoc(key, output string, jsonOutput bool) error {
	if jsonOutput {
		if key == "" {
			return fmt.Errorf("--key is required for JSON output")
		}
		url := fmt.Sprintf("https://api.github.com/codes_of_conduct/%s", key)
		detailBody, err := shared.FetchFuncDefault(url, requests.Options{
			Header: http.Header{
				"Accept":     {"application/json"},
				"User-Agent": {"omni-cli"},
			},
		})
		if err != nil {
			return fmt.Errorf("error fetching code of conduct: %w", err)
		}
		var coc codeOfConduct
		if err := json.Unmarshal(detailBody, &coc); err != nil {
			return fmt.Errorf("error parsing response: %w", err)
		}
		out, _ := json.MarshalIndent(map[string]interface{}{
			"name": coc.Name,
			"body": coc.Body,
		}, "", "  ")
		fmt.Println(string(out))
		return nil
	}

	return fetchCOC(key, output, shared.FetchFuncDefault)
}

func fetchCOC(key, output string, fetch shared.FetchFunc) error {
	body, err := fetch("https://api.github.com/codes_of_conduct", requests.Options{
		Header: http.Header{
			"Accept":     {"application/json"},
			"User-Agent": {"omni-cli"},
		},
	})
	if err != nil {
		return fmt.Errorf("error fetching codes of conduct: %w", err)
	}

	var codes []codeOfConduct
	if err := json.Unmarshal(body, &codes); err != nil {
		return fmt.Errorf("error parsing response: %w", err)
	}

	selectedKey := key
	if selectedKey == "" {
		var keys []string
		for _, c := range codes {
			keys = append(keys, c.Key)
		}

		prompt := &survey.Select{
			Message: "Select a Code of Conduct:",
			Options: keys,
		}
		if err := survey.AskOne(prompt, &selectedKey); err != nil {
			return fmt.Errorf("selection cancelled: %w", err)
		}
	}

	url := fmt.Sprintf("https://api.github.com/codes_of_conduct/%s", selectedKey)
	detailBody, err := fetch(url, requests.Options{
		Header: http.Header{
			"Accept":     {"application/json"},
			"User-Agent": {"omni-cli"},
		},
	})
	if err != nil {
		return fmt.Errorf("error fetching code of conduct: %w", err)
	}

	var coc codeOfConduct
	if err := json.Unmarshal(detailBody, &coc); err != nil {
		return fmt.Errorf("error parsing response: %w", err)
	}

	file, err := os.Create(output)
	if err != nil {
		return fmt.Errorf("error creating file: %w", err)
	}
	defer file.Close()

	if _, err := file.WriteString(coc.Body); err != nil {
		return fmt.Errorf("error writing file: %w", err)
	}

	fmt.Printf("Written %s (%s) to %s\n", coc.Name, coc.Key, output)
	return nil
}
