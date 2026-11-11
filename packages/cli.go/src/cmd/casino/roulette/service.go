package roulette

import (
	"encoding/json"
	"fmt"
	"math/rand"
)

type spinResult struct {
	Number int    `json:"number"`
	Color  string `json:"color"`
	Parity string `json:"parity"`
	Half   string `json:"half"`
}

var rouletteNumbers = []int{0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36,
	11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9,
	22, 18, 29, 7, 28, 12, 35, 3, 26}

func runRoulette(spins int, jsonOutput bool) error {
	var results []spinResult

	for i := 0; i < spins; i++ {
		n := rouletteNumbers[rand.Intn(len(rouletteNumbers))]
		color := "Green"
		if n == 0 {
			color = "Green"
		} else if n%2 == 0 {
			color = "Red"
		} else {
			color = "Black"
		}

		parity := "Even"
		if n == 0 {
			parity = "Neither"
		} else if n%2 == 0 {
			parity = "Even"
		} else {
			parity = "Odd"
		}

		half := "1-18"
		if n > 18 {
			half = "19-36"
		}

		results = append(results, spinResult{Number: n, Color: color, Parity: parity, Half: half})
	}

	if jsonOutput {
		b, _ := json.MarshalIndent(map[string]interface{}{
			"spins":   spins,
			"results": results,
		}, "", "  ")
		fmt.Println(string(b))
	} else {
		for i, r := range results {
			if spins == 1 {
				fmt.Printf("🎰 %d (%s, %s, %s)\n", r.Number, r.Color, r.Parity, r.Half)
			} else {
				fmt.Printf("  %2d. %d (%s, %s, %s)\n", i+1, r.Number, r.Color, r.Parity, r.Half)
			}
		}
	}
	return nil
}
