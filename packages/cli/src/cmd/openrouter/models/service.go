package models

import (
	"encoding/json"
	"fmt"
	"os"
	"sort"
	"strings"

	or "github.com/hieudoanm/omni/packages/cli/src/cmd/openrouter/openrouterlib"
	"github.com/hieudoanm/omni/packages/cli/src/libs/colors"
)

func runModels(modelsSearch string, modelsJSON bool) error {
	fmt.Fprint(os.Stderr, colors.Cyan("Fetching free models from OpenRouter...\n"))

	models, err := or.FetchFreeModels()
	if err != nil {
		return fmt.Errorf("failed to fetch models: %w", err)
	}

	if modelsSearch != "" {
		q := strings.ToLower(modelsSearch)
		filtered := models[:0]
		for _, m := range models {
			if strings.Contains(strings.ToLower(m.ID), q) ||
				strings.Contains(strings.ToLower(m.Name), q) {
				filtered = append(filtered, m)
			}
		}
		models = filtered
	}

	if len(models) == 0 {
		fmt.Println(colors.Yellow("No models found."))
		return nil
	}

	if modelsJSON {
		enc := json.NewEncoder(os.Stdout)
		enc.SetIndent("", "  ")
		return enc.Encode(models)
	}

	grouped := map[string][]or.Model{}
	for _, m := range models {
		parts := strings.SplitN(m.ID, "/", 2)
		provider := parts[0]
		grouped[provider] = append(grouped[provider], m)
	}

	providers := make([]string, 0, len(grouped))
	for p := range grouped {
		providers = append(providers, p)
	}
	sort.Strings(providers)

	fmt.Printf("\n%s\n\n", colors.Bold(colors.Green(fmt.Sprintf("%d free model(s) on OpenRouter", len(models)))))

	for _, provider := range providers {
		fmt.Printf("  %s\n", colors.Bold(colors.Cyan(provider)))
		for _, m := range grouped[provider] {
			var ctx string
			if m.ContextLength > 0 {
				ctx = colors.Dim(fmt.Sprintf(" [%s ctx]", formatCtx(m.ContextLength)))
			}
			fmt.Printf("    %s%s\n", m.ID, ctx)

			if m.Description != "" {
				desc := m.Description
				if len(desc) > 72 {
					desc = desc[:71] + "?"
				}
				fmt.Printf("      %s\n", colors.Dim(desc))
			}
		}
		fmt.Println()
	}

	fmt.Printf("  %s%s%s\n", colors.Dim("Run: "), "fr run <model-id>", colors.Dim(" to start a local proxy"))

	return nil
}

func formatCtx(n int) string {
	switch {
	case n >= 1_000_000:
		return fmt.Sprintf("%dM", n/1_000_000)
	case n >= 1_000:
		return fmt.Sprintf("%dk", n/1_000)
	default:
		return fmt.Sprintf("%d", n)
	}
}
