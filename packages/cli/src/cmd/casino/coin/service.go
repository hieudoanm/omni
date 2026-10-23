package coin

import (
	"encoding/json"
	"fmt"
	"math/rand"
)

func runCoin(count int, jsonOutput bool) error {
	results := make([]string, count)
	heads, tails := 0, 0
	for i := 0; i < count; i++ {
		if rand.Intn(2) == 0 {
			results[i] = "Heads"
			heads++
		} else {
			results[i] = "Tails"
			tails++
		}
	}

	if jsonOutput {
		b, _ := json.MarshalIndent(map[string]interface{}{
			"results": results,
			"count":   count,
			"heads":   heads,
			"tails":   tails,
		}, "", "  ")
		fmt.Println(string(b))
	} else if count == 1 {
		fmt.Println(results[0])
	} else {
		for i, r := range results {
			fmt.Printf("%2d. %s\n", i+1, r)
		}
		fmt.Printf("\nHeads: %d (%d%%), Tails: %d (%d%%)\n",
			heads, heads*100/count, tails, tails*100/count)
	}
	return nil
}
