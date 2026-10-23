package base

import (
	"encoding/json"
	"fmt"
	"strconv"
)

func runBase(value, from, to string, jsonOutput bool) error {
	base := map[string]int{
		"bin": 2, "binary": 2,
		"oct": 8, "octal": 8,
		"dec": 10, "decimal": 10,
		"hex": 16, "hexadecimal": 16,
	}
	fromBase, ok := base[from]
	if !ok {
		return fmt.Errorf("unknown base: %s (use bin/oct/dec/hex)", from)
	}
	toBase, ok := base[to]
	if !ok {
		return fmt.Errorf("unknown base: %s (use bin/oct/dec/hex)", to)
	}

	n, err := strconv.ParseInt(value, fromBase, 64)
	if err != nil {
		return fmt.Errorf("invalid value %q for base %s: %w", value, from, err)
	}

	result := strconv.FormatInt(n, toBase)
	baseNames := map[int]string{2: "binary", 8: "octal", 10: "decimal", 16: "hexadecimal"}

	if jsonOutput {
		out, err := json.MarshalIndent(map[string]interface{}{
			"value":  value,
			"from":   baseNames[fromBase],
			"to":     baseNames[toBase],
			"result": result,
		}, "", "  ")
		if err != nil {
			return err
		}
		fmt.Println(string(out))
	} else {
		fmt.Printf("%s (%s) = %s (%s)\n", value, baseNames[fromBase], result, baseNames[toBase])
	}
	return nil
}
