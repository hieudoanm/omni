package list

import (
	"fmt"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/colors/figma/internal"
)

func runList(jsonOutput bool) error {
	names := internal.PaletteNames()

	if jsonOutput {
		fmt.Print("[")
		for i, n := range names {
			if i > 0 {
				fmt.Print(",")
			}
			fmt.Printf("%q", n)
		}
		fmt.Println("]")
		return nil
	}

	for _, n := range names {
		fmt.Println(n)
	}
	return nil
}
