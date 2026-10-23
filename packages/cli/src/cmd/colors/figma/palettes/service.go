package palettes

import (
	"fmt"
	"sort"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/colors/figma/internal"
)

func runPalettes(jsonOutput bool) error {
	palettes := internal.Palettes()
	names := internal.PaletteNames()

	if jsonOutput {
		fmt.Print("{")
		for i, pn := range names {
			if i > 0 {
				fmt.Print(",")
			}
			colors := palettes[pn]
			fmt.Printf("%q:[", pn)
			for j, c := range colors {
				if j > 0 {
					fmt.Print(",")
				}
				fmt.Printf("{\"name\":%q,\"hex\":%q}", c.Name, c.Hex)
			}
			fmt.Print("]")
		}
		fmt.Println("}")
		return nil
	}

	sorted := make([]string, len(names))
	copy(sorted, names)
	sort.Strings(sorted)

	for _, pn := range sorted {
		colors := palettes[pn]
		sort.Slice(colors, func(i, j int) bool { return colors[i].Name < colors[j].Name })
		fmt.Printf("=== %s ===\n", pn)
		for _, c := range colors {
			fmt.Printf("  %s  %s\n", c.Hex, c.Name)
		}
		fmt.Println()
	}
	return nil
}
