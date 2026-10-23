package dice

import (
	"encoding/json"
	"fmt"
	"math/rand"
)

func runDice(sides, count int, jsonOutput bool) error {
	results := make([]int, count)
	var total int
	for i := 0; i < count; i++ {
		results[i] = rand.Intn(sides) + 1
		total += results[i]
	}

	if jsonOutput {
		b, _ := json.MarshalIndent(map[string]interface{}{
			"results": results,
			"count":   count,
			"sides":   sides,
			"total":   total,
		}, "", "  ")
		fmt.Println(string(b))
	} else if count == 1 {
		fmt.Printf("🎲 %d\n", results[0])
	} else {
		fmt.Printf("Rolling %dd%d:\n", count, sides)
		for i, r := range results {
			fmt.Printf("  Die %d: %d\n", i+1, r)
		}
		fmt.Printf("\nTotal: %d\n", total)
	}
	return nil
}
