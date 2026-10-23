package openrouterlib

import (
	"encoding/json"
	"fmt"
	"net/http"
	"sort"
	"strings"
)

const BaseURL = "https://openrouter.ai/api/v1"

type Model struct {
	ID            string  `json:"id"`
	Name          string  `json:"name"`
	Description   string  `json:"description"`
	ContextLength int     `json:"context_length"`
	Pricing       Pricing `json:"pricing"`
}

type Pricing struct {
	Prompt     string `json:"prompt"`
	Completion string `json:"completion"`
	Request    string `json:"request"`
}

type modelsResponse struct {
	Data []Model `json:"data"`
}

func FetchFreeModels() ([]Model, error) {
	resp, err := http.Get(BaseURL + "/models")
	if err != nil {
		return nil, fmt.Errorf("request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("OpenRouter returned HTTP %d", resp.StatusCode)
	}

	var payload modelsResponse
	if err := json.NewDecoder(resp.Body).Decode(&payload); err != nil {
		return nil, fmt.Errorf("decode error: %w", err)
	}

	var free []Model
	for _, m := range payload.Data {
		if isFree(m.Pricing) {
			free = append(free, m)
		}
	}

	sort.Slice(free, func(i, j int) bool {
		return free[i].ID < free[j].ID
	})

	return free, nil
}

func isFree(p Pricing) bool {
	return (p.Prompt == "0" || p.Prompt == "") &&
		(p.Completion == "0" || p.Completion == "")
}

func ResolveModel(query string, models []Model) *Model {
	q := strings.ToLower(query)

	for i, m := range models {
		if strings.ToLower(m.ID) == q {
			return &models[i]
		}
	}

	for i, m := range models {
		if strings.ToLower(m.ID) == q+":free" {
			return &models[i]
		}
	}

	var idMatches []Model
	for _, m := range models {
		if strings.Contains(strings.ToLower(m.ID), q) {
			idMatches = append(idMatches, m)
		}
	}
	if len(idMatches) == 1 {
		return &idMatches[0]
	}
	if len(idMatches) > 1 {
		sort.Slice(idMatches, func(i, j int) bool {
			iFree := strings.HasSuffix(idMatches[i].ID, ":free")
			jFree := strings.HasSuffix(idMatches[j].ID, ":free")
			if iFree != jFree {
				return iFree
			}
			return len(idMatches[i].ID) < len(idMatches[j].ID)
		})
		return &idMatches[0]
	}

	var nameMatches []Model
	for _, m := range models {
		if strings.Contains(strings.ToLower(m.Name), q) {
			nameMatches = append(nameMatches, m)
		}
	}
	if len(nameMatches) > 0 {
		sort.Slice(nameMatches, func(i, j int) bool {
			return len(nameMatches[i].ID) < len(nameMatches[j].ID)
		})
		return &nameMatches[0]
	}

	return nil
}
