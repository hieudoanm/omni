package random

import (
	"encoding/json"
	"fmt"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/colors/internal"
	"github.com/spf13/cobra"
)

func runRandom(cmd *cobra.Command, args []string) error {
	jsonOutput, _ := cmd.Flags().GetBool("json")
	maxHEX, _ := cmd.Flags().GetInt("max")
	if jsonOutput {
		var colors []map[string]interface{}
		for i := 0; i < maxHEX; i++ {
			newHEX := internal.GenerateRandomHexColor()
			hex := internal.Hex(newHEX)
			r, g, b, err := hex.ToRGB()
			if err != nil {
				continue
			}
			colors = append(colors, map[string]interface{}{
				"hex": newHEX,
				"rgb": map[string]interface{}{"r": r, "g": g, "b": b},
			})
		}
		out, _ := json.MarshalIndent(colors, "", "  ")
		fmt.Println(string(out))
		return nil
	}
	for i := 0; i < maxHEX; i++ {
		newHEX := internal.GenerateRandomHexColor()
		hex := internal.Hex(newHEX)
		r, g, b, err := hex.ToRGB()
		if err != nil {
			fmt.Println("Error converting HEX to RGB:", err)
			continue
		}
		fmt.Printf("%s - rgb(%d, %d, %d)\n", newHEX, r, g, b)
	}
	return nil
}
