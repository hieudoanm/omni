package discount

import (
	"encoding/json"
	"fmt"
)

func runDiscount(original, percent float64, jsonOutput bool) error {
	discount := original * percent / 100
	final := original - discount

	if jsonOutput {
		out, err := json.MarshalIndent(map[string]interface{}{
			"original":    original,
			"percent":     percent,
			"discount":    discount,
			"final_price": final,
		}, "", "  ")
		if err != nil {
			return err
		}
		fmt.Println(string(out))
	} else {
		fmt.Println("=== Discount Calculator ===")
		fmt.Printf("Original price:  %12.2f\n", original)
		fmt.Printf("Discount:        %12.2f%%\n", percent)
		fmt.Printf("You save:        %12.2f\n", discount)
		fmt.Printf("Final price:     %12.2f\n", final)
	}
	return nil
}
