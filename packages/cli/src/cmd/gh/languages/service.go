package languages

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"sort"
	"strings"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/gh/shared"
	requests "github.com/hieudoanm/omni/packages/cli/src/libs/requests"
)

func runLanguages(repo, output string, jsonOutput bool) error {
	if jsonOutput {
		parts := strings.Split(repo, "/")
		if len(parts) != 2 {
			return fmt.Errorf("repo must be in format owner/repo (got %q)", repo)
		}
		url := fmt.Sprintf("https://api.github.com/repos/%s/%s/languages", parts[0], parts[1])
		body, err := shared.FetchFuncDefault(url, requests.Options{
			Header: http.Header{
				"Accept":     {"application/json"},
				"User-Agent": {"omni-cli"},
			},
		})
		if err != nil {
			return fmt.Errorf("error fetching languages: %w", err)
		}
		var langs map[string]int
		if err := json.Unmarshal(body, &langs); err != nil {
			return fmt.Errorf("error parsing response: %w", err)
		}
		out, _ := json.MarshalIndent(map[string]interface{}{
			"languages": langs,
		}, "", "  ")
		fmt.Println(string(out))
		return nil
	}

	return fetchLanguages(repo, output, shared.FetchFuncDefault)
}

func fetchLanguages(repo, output string, fetch shared.FetchFunc) error {
	parts := strings.Split(repo, "/")
	if len(parts) != 2 {
		return fmt.Errorf("repo must be in format owner/repo (got %q)", repo)
	}

	url := fmt.Sprintf("https://api.github.com/repos/%s/%s/languages", parts[0], parts[1])
	body, err := fetch(url, requests.Options{
		Header: http.Header{
			"Accept":     {"application/json"},
			"User-Agent": {"omni-cli"},
		},
	})
	if err != nil {
		return fmt.Errorf("error fetching languages: %w", err)
	}

	var langs map[string]int
	if err := json.Unmarshal(body, &langs); err != nil {
		return fmt.Errorf("error parsing response: %w", err)
	}

	if len(langs) == 0 {
		fmt.Println("No languages found")
		return nil
	}

	fmt.Println("Languages:")
	for lang, bytes := range langs {
		fmt.Printf("  %s: %d bytes\n", lang, bytes)
	}

	svg := GenerateLanguagesSVG(langs)
	if err := os.WriteFile(output, []byte(svg), 0644); err != nil {
		return fmt.Errorf("error writing SVG: %w", err)
	}

	fmt.Printf("✓ languages.svg generated at %s\n", output)
	return nil
}

func GenerateLanguagesSVG(langs map[string]int) string {
	type langEntry struct {
		name  string
		bytes int
	}
	var entries []langEntry
	var total int
	for name, bytes := range langs {
		entries = append(entries, langEntry{name, bytes})
		total += bytes
	}
	sort.Slice(entries, func(i, j int) bool {
		return entries[i].bytes > entries[j].bytes
	})

	barHeight := 24
	gap := 4
	barWidth := 400
	height := len(entries)*(barHeight+gap) + 40
	var sb strings.Builder
	sb.WriteString(fmt.Sprintf(`<svg xmlns="http://www.w3.org/2000/svg" width="%d" height="%d" viewBox="0 0 %d %d">
`, barWidth+20, height, barWidth+20, height))
	sb.WriteString(fmt.Sprintf(`<rect width="%d" height="%d" fill="#0d1117" rx="6"/>
`, barWidth+20, height))
	sb.WriteString(fmt.Sprintf(`<text x="%d" y="20" fill="#c9d1d9" font-family="sans-serif" font-size="13" font-weight="600">Languages</text>
`, 10))

	y := 35
	for _, e := range entries {
		pct := float64(e.bytes) / float64(total) * 100
		w := int(float64(barWidth) * pct / 100)
		if w < 1 && pct > 0 {
			w = 1
		}
		color := shared.LanguageColors[e.name]
		if color == "" {
			color = "#6e7681"
		}

		sb.WriteString(fmt.Sprintf(`<rect x="10" y="%d" width="%d" height="%d" fill="%s" rx="3"/>
`, y, w, barHeight, color))
		sb.WriteString(fmt.Sprintf(`<text x="%d" y="%d" fill="#8b949e" font-family="sans-serif" font-size="11">%s</text>
`, 15, y+16, e.name))
		sb.WriteString(fmt.Sprintf(`<text x="%d" y="%d" fill="#8b949e" font-family="sans-serif" font-size="11" text-anchor="end">%.1f%%</text>
`, barWidth+15, y+16, pct))

		y += barHeight + gap
	}

	sb.WriteString("</svg>\n")
	return sb.String()
}
