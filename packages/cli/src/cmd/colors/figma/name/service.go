package name

import (
	"encoding/json"
	"fmt"
	"strings"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/colors/figma/internal"
)

func runName(query string, jsonOutput bool) error {
	for _, pn := range internal.PaletteNames() {
		if strings.EqualFold(pn, query) {
			colors := internal.Palettes()[pn]
			if jsonOutput {
				out, _ := json.MarshalIndent(map[string]interface{}{
					"palette": pn,
					"colors":  colors,
				}, "", "  ")
				fmt.Println(string(out))
				return nil
			}
			fmt.Printf("Palette: %s\n", pn)
			for _, c := range colors {
				fmt.Printf("  %s %s\n", c.Hex, c.Name)
			}
			return nil
		}
	}

	hex, ok := internal.Lookup(query)
	if ok {
		exactName := internal.FindExactName(query)
		if jsonOutput {
			out, _ := json.MarshalIndent(map[string]string{
				"name": exactName,
				"hex":  hex,
			}, "", "  ")
			fmt.Println(string(out))
			return nil
		}
		fmt.Printf("%s %s\n", hex, exactName)
		return nil
	}

	names := internal.PaletteNames()
	var suggestions []string
	ql := strings.ToLower(query)
	for _, n := range names {
		if strings.Contains(strings.ToLower(n), ql) {
			suggestions = append(suggestions, n)
		}
	}
	if len(suggestions) > 0 {
		if jsonOutput {
			out, _ := json.MarshalIndent(map[string]interface{}{
				"error":   fmt.Sprintf("palette %q not found", query),
				"similar": suggestions,
			}, "", "  ")
			fmt.Println(string(out))
			return nil
		}
		fmt.Printf("Palette %q not found. Did you mean?\n", query)
		for _, s := range suggestions {
			fmt.Printf("  %s\n", s)
		}
		return nil
	}

	if jsonOutput {
		out, _ := json.MarshalIndent(map[string]string{
			"error": fmt.Sprintf("palette %q not found", query),
		}, "", "  ")
		fmt.Println(string(out))
		return nil
	}
	return fmt.Errorf("palette %q not found", query)
}
