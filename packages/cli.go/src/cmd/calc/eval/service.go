package eval

import (
	"encoding/json"
	"fmt"
)

func runEval(expression string, jsonOutput bool) error {
	v, err := newEvaluator(expression).eval()
	if err != nil {
		return fmt.Errorf("eval: %w", err)
	}
	if jsonOutput {
		b, _ := json.MarshalIndent(map[string]interface{}{
			"expression": expression,
			"result":     v,
		}, "", "  ")
		fmt.Println(string(b))
	} else {
		fmt.Println(v)
	}
	return nil
}
