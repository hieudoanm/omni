package hex

import (
	"encoding/json"
	"fmt"
	"math"
	"strings"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/colors/figma/internal"
)

type rgb struct {
	r, g, b float64
}

func parseHex(hex string) (rgb, error) {
	hex = strings.TrimPrefix(hex, "#")
	if len(hex) != 6 {
		return rgb{}, fmt.Errorf("invalid hex: %s", hex)
	}
	var r, g, b int
	_, err := fmt.Sscanf(hex, "%02x%02x%02x", &r, &g, &b)
	if err != nil {
		return rgb{}, err
	}
	return rgb{float64(r), float64(g), float64(b)}, nil
}

func colorDistance(c1, c2 rgb) float64 {
	dr := c1.r - c2.r
	dg := c1.g - c2.g
	db := c1.b - c2.b
	return math.Sqrt(dr*dr + dg*dg + db*db)
}

func hexToName(hex string) (string, float64, bool) {
	target, err := parseHex(hex)
	if err != nil {
		return "", 0, false
	}

	closestName := ""
	closestDist := math.MaxFloat64

	for name, h := range internal.All() {
		c, err := parseHex(h)
		if err != nil {
			continue
		}
		dist := colorDistance(target, c)
		if dist < closestDist {
			closestDist = dist
			closestName = name
		}
	}

	return closestName, closestDist, closestName != ""
}

func runHex(hex string, jsonOutput bool) error {
	if !strings.HasPrefix(hex, "#") {
		hex = "#" + hex
	}

	name, dist, ok := hexToName(hex)
	if !ok {
		return fmt.Errorf("invalid hex: %s", hex)
	}

	palettes := internal.FindPalettesByHex(internal.All()[name])

	if jsonOutput {
		out, _ := json.MarshalIndent(map[string]interface{}{
			"input":       hex,
			"name":        name,
			"hex":         internal.All()[name],
			"distance":    math.Round(dist*100) / 100,
			"exact_match": dist == 0,
			"palettes":    palettes,
		}, "", "  ")
		fmt.Println(string(out))
		return nil
	}

	if dist == 0 {
		fmt.Printf("Exact match: %s %s\n", internal.All()[name], name)
	} else {
		fmt.Printf("Closest match: %s %s (distance: %.2f)\n", internal.All()[name], name, dist)
	}
	if len(palettes) > 0 {
		fmt.Printf("Palette: %s\n", palettes[0])
	}
	return nil
}
