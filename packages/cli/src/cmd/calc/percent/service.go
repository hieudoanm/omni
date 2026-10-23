package percent

import (
	"encoding/json"
	"fmt"
)

func runPercent(value, of, plus, minus float64, jsonOutput bool) error {
	switch {
	case of != 0:
		pct := value / of * 100
		if jsonOutput {
			out, err := json.MarshalIndent(map[string]interface{}{
				"value":      value,
				"of":         of,
				"percentage": pct,
				"type":       "percentage_of",
			}, "", "  ")
			if err != nil {
				return err
			}
			fmt.Println(string(out))
		} else {
			fmt.Printf("%.2f is %.2f%% of %.2f\n", value, pct, of)
		}
	case plus != 0:
		result := value * (1 + plus/100)
		if jsonOutput {
			out, err := json.MarshalIndent(map[string]interface{}{
				"value":  value,
				"change": plus,
				"result": result,
				"type":   "add_percentage",
			}, "", "  ")
			if err != nil {
				return err
			}
			fmt.Println(string(out))
		} else {
			fmt.Printf("%.2f + %.2f%% = %.2f\n", value, plus, result)
		}
	case minus != 0:
		result := value * (1 - minus/100)
		if jsonOutput {
			out, err := json.MarshalIndent(map[string]interface{}{
				"value":  value,
				"change": minus,
				"result": result,
				"type":   "subtract_percentage",
			}, "", "  ")
			if err != nil {
				return err
			}
			fmt.Println(string(out))
		} else {
			fmt.Printf("%.2f - %.2f%% = %.2f\n", value, minus, result)
		}
	default:
		return fmt.Errorf("use --of, --plus, or --minus")
	}
	return nil
}
