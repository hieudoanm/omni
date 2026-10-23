package random

import (
	"encoding/json"
	"fmt"
	"math/rand/v2"
)

func runRandom(min, max float64, count int, jsonOutput bool) error {
	if count < 1 {
		count = 1
	}

	nums := make([]float64, count)
	for i := range count {
		nums[i] = min + rand.Float64()*(max-min)
	}

	if jsonOutput {
		b, _ := json.MarshalIndent(map[string]interface{}{
			"min":    min,
			"max":    max,
			"count":  count,
			"values": nums,
		}, "", "  ")
		fmt.Println(string(b))
	} else {
		for _, v := range nums {
			fmt.Println(v)
		}
	}
	return nil
}
