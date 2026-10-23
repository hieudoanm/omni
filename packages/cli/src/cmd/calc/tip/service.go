package tip

import (
	"encoding/json"
	"fmt"
)

func runTip(bill, tipPercent float64, split int, jsonOutput bool) error {
	if split < 1 {
		split = 1
	}
	tip := bill * tipPercent / 100
	total := bill + tip
	perPerson := total / float64(split)

	if jsonOutput {
		out, err := json.MarshalIndent(map[string]interface{}{
			"bill":        bill,
			"tip_percent": tipPercent,
			"tip":         tip,
			"total":       total,
			"split":       split,
			"per_person":  perPerson,
		}, "", "  ")
		if err != nil {
			return err
		}
		fmt.Println(string(out))
	} else {
		fmt.Println("=== Tip Calculator ===")
		fmt.Printf("Bill:          %12.2f\n", bill)
		fmt.Printf("Tip %%:          %11.0f%%\n", tipPercent)
		fmt.Printf("Tip amount:    %12.2f\n", tip)
		fmt.Printf("Total:         %12.2f\n", total)
		fmt.Printf("Split:         %12d\n", split)
		fmt.Printf("Per person:    %12.2f\n", perPerson)
	}
	return nil
}
