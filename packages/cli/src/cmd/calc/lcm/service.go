package lcm

import (
	"encoding/json"
	"fmt"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/calc/internal"
)

func runLcm(a, b int, jsonOutput bool) error {
	ai, bi := int64(a), int64(b)
	result := ai / internal.Gcd(ai, bi) * bi
	if jsonOutput {
		b, _ := json.MarshalIndent(map[string]interface{}{
			"a":   a,
			"b":   b,
			"lcm": result,
		}, "", "  ")
		fmt.Println(string(b))
	} else {
		fmt.Println(result)
	}
	return nil
}
