package gcd

import (
	"encoding/json"
	"fmt"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/calc/internal"
)

func runGcd(a, b int, jsonOutput bool) error {
	result := internal.Gcd(int64(a), int64(b))
	if jsonOutput {
		b, _ := json.MarshalIndent(map[string]interface{}{
			"a":   a,
			"b":   b,
			"gcd": result,
		}, "", "  ")
		fmt.Println(string(b))
	} else {
		fmt.Println(result)
	}
	return nil
}
