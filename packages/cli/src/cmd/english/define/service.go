package define

import (
	"encoding/json"
	"fmt"
	"strings"

	"github.com/hieudoanm/omni/packages/cli/src/libs/requests"
)

type Result struct {
	Definition   string   `json:"definition"`
	PartOfSpeech string   `json:"partOfSpeech"`
	Synonyms     []string `json:"synonyms"`
	Anonyms      []string `json:"anonyms"`
	UsageOf      []string `json:"usageOf"`
	TypeOf       []string `json:"typeOf"`
}

type Word struct {
	Word    string   `json:"word"`
	Results []Result `json:"results"`
}

type fetchFunc func(url string, opts requests.Options) ([]byte, error)

func lookupWord(word string, fetch fetchFunc) (*Word, error) {
	url := fmt.Sprintf(
		"https://raw.githubusercontent.com/hieudoanm/words/refs/heads/master/packages/data/english/words/%s.json",
		word,
	)
	body, err := fetch(url, requests.Options{})
	if err != nil {
		return nil, fmt.Errorf("fetch error: %w", err)
	}
	var data Word
	if err := json.Unmarshal(body, &data); err != nil {
		return nil, fmt.Errorf("json error: %w", err)
	}
	return &data, nil
}

func formatDefinition(data *Word, jsonOutput bool) string {
	if jsonOutput {
		out, err := json.MarshalIndent(data, "", "  ")
		if err != nil {
			return err.Error()
		}
		return string(out)
	}

	var b strings.Builder
	b.WriteString(fmt.Sprintf("\nWORD: %s\n\n", data.Word))
	for i, r := range data.Results {
		b.WriteString(fmt.Sprintf("%d) %s\n", i+1, r.PartOfSpeech))
		b.WriteString(fmt.Sprintf("   Definition: %s\n", r.Definition))
		if len(r.Synonyms) > 0 {
			b.WriteString(fmt.Sprintf("   Synonyms: %s\n", strings.Join(r.Synonyms, ", ")))
		}
		if len(r.Anonyms) > 0 {
			b.WriteString(fmt.Sprintf("   Antonyms: %s\n", strings.Join(r.Anonyms, ", ")))
		}
		b.WriteString("\n")
	}
	return b.String()
}
