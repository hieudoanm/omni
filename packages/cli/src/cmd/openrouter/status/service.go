package status

import (
	"encoding/json"
	"fmt"
	"os"
	"sort"
	"strings"
	"sync"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/openrouter/config"
	or "github.com/hieudoanm/omni/packages/cli/src/cmd/openrouter/openrouterlib"
	"github.com/hieudoanm/omni/packages/cli/src/libs/colors"
)

func runStatus(statusSearch string, statusWorkers int, jsonOutput bool) error {
	apiKey := config.LoadAPIKey()
	if apiKey == "" {
		return fmt.Errorf("no OpenRouter API key found.\n  Set OPEN_ROUTER_API_KEY or add it to ~/.omni")
	}

	fmt.Fprint(os.Stderr, colors.Cyan("Fetching free models from OpenRouter...\n"))

	models, err := or.FetchFreeModels()
	if err != nil {
		return fmt.Errorf("failed to fetch models: %w", err)
	}

	if statusSearch != "" {
		q := strings.ToLower(statusSearch)
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
		if jsonOutput {
			fmt.Println(`{"results":[],"counts":{"ok":0,"rate_limited":0,"restricted":0,"error":0}}`)
			return nil
		}
		fmt.Println(colors.Yellow("No models found."))
		return nil
	}

	fmt.Fprintf(os.Stderr, colors.Cyan("Probing %d model(s) with %d workers...\n"),
		len(models), statusWorkers)

	jobs := make(chan or.Model, len(models))
	for _, m := range models {
		jobs <- m
	}
	close(jobs)

	results := make([]or.ProbeResult, len(models))
	var mu sync.Mutex
	var wg sync.WaitGroup
	var idx int

	for i := 0; i < statusWorkers; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			for m := range jobs {
				r := or.ProbeModel(m, apiKey)
				mu.Lock()
				results[idx] = r
				idx++
				mu.Unlock()
			}
		}()
	}
	wg.Wait()

	sort.Slice(results, func(i, j int) bool {
		if results[i].Status != results[j].Status {
			return results[i].Status < results[j].Status
		}
		if results[i].Status == or.StatusOK {
			return results[i].Latency < results[j].Latency
		}
		return results[i].Model.ID < results[j].Model.ID
	})

	counts := map[or.ProbeStatus]int{}
	for _, r := range results {
		counts[r.Status]++
	}

	if jsonOutput {
		type resultItem struct {
			Model     or.Model `json:"model"`
			Status    string   `json:"status"`
			Message   string   `json:"message,omitempty"`
			LatencyMs int64    `json:"latency_ms,omitempty"`
		}
		items := make([]resultItem, len(results))
		for i, r := range results {
			statusStr := ""
			switch r.Status {
			case or.StatusOK:
				statusStr = "ok"
			case or.StatusRateLimited:
				statusStr = "rate_limited"
			case or.StatusRestricted:
				statusStr = "restricted"
			case or.StatusError:
				statusStr = "error"
			}
			items[i] = resultItem{
				Model:     r.Model,
				Status:    statusStr,
				Message:   r.Message,
				LatencyMs: r.Latency,
			}
		}
		out, _ := json.Marshal(map[string]interface{}{
			"results": items,
			"counts": map[string]int{
				"ok":           counts[or.StatusOK],
				"rate_limited": counts[or.StatusRateLimited],
				"restricted":   counts[or.StatusRestricted],
				"error":        counts[or.StatusError],
			},
		})
		fmt.Println(string(out))
		return nil
	}

	fmt.Println()
	fmt.Printf("  %s", colors.Bold(colors.Green(fmt.Sprintf("%d OK", counts[or.StatusOK]))))
	fmt.Printf("  %s", colors.Bold(colors.Yellow(fmt.Sprintf("%d rate-limited", counts[or.StatusRateLimited]))))
	fmt.Printf("  %s", colors.Bold(colors.Red(fmt.Sprintf("%d restricted", counts[or.StatusRestricted]))))
	fmt.Printf("  %s\n", colors.Bold(colors.Red(fmt.Sprintf("%d error", counts[or.StatusError]))))
	fmt.Println()

	for _, r := range results {
		switch r.Status {
		case or.StatusOK:
			fmt.Printf("  %s %-52s %s\n",
				colors.Bold(colors.Green("OK")),
				r.Model.ID,
				colors.Dim(fmt.Sprintf("%dms", r.Latency)))

		case or.StatusRateLimited:
			fmt.Printf("  %s %-52s %s\n",
				colors.Bold(colors.Yellow("RATE-LIMIT")),
				r.Model.ID,
				colors.Dim(truncate(r.Message, 60)))

		case or.StatusRestricted:
			fmt.Printf("  %s %-52s %s\n",
				colors.Bold(colors.Red("RESTRICTED")),
				r.Model.ID,
				colors.Dim("privacy/guardrail"))

		case or.StatusError:
			fmt.Printf("  %s %-52s %s\n",
				colors.Bold(colors.Red("ERROR")),
				r.Model.ID,
				colors.Dim(truncate(r.Message, 60)))
		}
	}

	fmt.Println()
	fmt.Print(colors.Dim("  Tip: "))
	fmt.Print("rate-limited models recover in ~1 min. ")
	fmt.Println(colors.Dim("Restricted models need or.ai/settings/privacy"))
	fmt.Println()

	return nil
}

func truncate(s string, max int) string {
	if len(s) <= max {
		return s
	}
	return s[:max-1] + "?"
}
