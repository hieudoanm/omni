package license

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"

	"github.com/AlecAivazis/survey/v2"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/gh/shared"
	requests "github.com/hieudoanm/omni/packages/cli/src/libs/requests"
)

type license struct {
	Key    string `json:"key"`
	Name   string `json:"name"`
	SpdxID string `json:"spdx_id"`
	URL    string `json:"url"`
	Body   string `json:"body"`
}

func runLicense(spdxID, output string, jsonOutput bool) error {
	if jsonOutput {
		if spdxID == "" {
			return fmt.Errorf("--spdx-id is required for JSON output")
		}
		url := fmt.Sprintf("https://api.github.com/licenses/%s", spdxID)
		detailBody, err := shared.FetchFuncDefault(url, requests.Options{
			Header: http.Header{
				"Accept":     {"application/json"},
				"User-Agent": {"omni-cli"},
			},
		})
		if err != nil {
			return fmt.Errorf("error fetching license: %w", err)
		}
		var lic license
		if err := json.Unmarshal(detailBody, &lic); err != nil {
			return fmt.Errorf("error parsing response: %w", err)
		}
		out, _ := json.MarshalIndent(map[string]interface{}{
			"name":    lic.Name,
			"spdx_id": lic.SpdxID,
			"url":     lic.URL,
			"body":    lic.Body,
		}, "", "  ")
		fmt.Println(string(out))
		return nil
	}

	return fetchLicense(spdxID, output, shared.FetchFuncDefault)
}

func fetchLicense(spdxID, output string, fetch shared.FetchFunc) error {
	body, err := fetch("https://api.github.com/licenses", requests.Options{
		Header: http.Header{
			"Accept":     {"application/json"},
			"User-Agent": {"omni-cli"},
		},
	})
	if err != nil {
		return fmt.Errorf("error fetching licenses: %w", err)
	}

	var licenses []license
	if err := json.Unmarshal(body, &licenses); err != nil {
		return fmt.Errorf("error parsing response: %w", err)
	}

	selectedSpdxID := spdxID
	if selectedSpdxID == "" {
		var spdxIds []string
		for _, l := range licenses {
			spdxIds = append(spdxIds, l.SpdxID)
		}

		prompt := &survey.Select{
			Message: "Select a license:",
			Options: spdxIds,
		}
		if err := survey.AskOne(prompt, &selectedSpdxID); err != nil {
			return fmt.Errorf("selection cancelled: %w", err)
		}
	}

	url := fmt.Sprintf("https://api.github.com/licenses/%s", selectedSpdxID)
	detailBody, err := fetch(url, requests.Options{
		Header: http.Header{
			"Accept":     {"application/json"},
			"User-Agent": {"omni-cli"},
		},
	})
	if err != nil {
		return fmt.Errorf("error fetching license: %w", err)
	}

	var lic license
	if err := json.Unmarshal(detailBody, &lic); err != nil {
		return fmt.Errorf("error parsing response: %w", err)
	}

	file, err := os.Create(output)
	if err != nil {
		return fmt.Errorf("error creating file: %w", err)
	}
	defer file.Close()

	if _, err := file.WriteString(lic.Body); err != nil {
		return fmt.Errorf("error writing file: %w", err)
	}

	fmt.Printf("Written %s (%s) to %s\n", lic.Name, lic.SpdxID, output)
	return nil
}
