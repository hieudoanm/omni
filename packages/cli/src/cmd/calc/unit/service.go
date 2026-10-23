package unit

import (
	"encoding/json"
	"fmt"
)

func runUnit(value float64, from, to string, jsonOutput bool) error {
	fromUnit := findUnit(from)
	if fromUnit == nil {
		return fmt.Errorf("unknown unit: %s", from)
	}
	toUnit := findUnit(to)
	if toUnit == nil {
		return fmt.Errorf("unknown unit: %s", to)
	}
	if fromUnit.cat != toUnit.cat {
		return fmt.Errorf("cannot convert %s (%s) to %s (%s)", from, fromUnit.cat, to, toUnit.cat)
	}

	base := fromUnit.toBase(value)
	result := toUnit.fromBase(base)
	if jsonOutput {
		out, err := json.MarshalIndent(map[string]interface{}{
			"value":    value,
			"from":     from,
			"to":       to,
			"result":   result,
			"category": fromUnit.cat,
		}, "", "  ")
		if err != nil {
			return err
		}
		fmt.Println(string(out))
	} else {
		fmt.Printf("%g %s = %g %s\n", value, from, result, to)
	}
	return nil
}
