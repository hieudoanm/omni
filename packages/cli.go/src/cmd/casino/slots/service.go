package slots

import (
	"encoding/json"
	"fmt"
	"math/rand"
)

var slotsSymbols = []string{"🍒", "🍋", "🔔", "💎", "7️⃣", "BAR"}
var slotsPayouts = [6]int{2, 3, 5, 10, 20, 50}

type slotsSpinResult struct {
	Reels   []string `json:"reels"`
	Win     int      `json:"win"`
	Balance int      `json:"balance"`
}

func runSlotsPlay(bet, spins int, jsonOutput bool) error {
	balance := 1000
	var spinResults []slotsSpinResult

	for i := 0; i < spins; i++ {
		reels := [3]int{
			rand.Intn(len(slotsSymbols)),
			rand.Intn(len(slotsSymbols)),
			rand.Intn(len(slotsSymbols)),
		}

		win := 0
		if reels[0] == reels[1] && reels[1] == reels[2] {
			win = bet * slotsPayouts[reels[0]]
		}
		balance += win

		spinResults = append(spinResults, slotsSpinResult{
			Reels:   []string{slotsSymbols[reels[0]], slotsSymbols[reels[1]], slotsSymbols[reels[2]]},
			Win:     win,
			Balance: balance,
		})
	}

	if jsonOutput {
		b, _ := json.MarshalIndent(map[string]interface{}{
			"spins": spinResults,
			"bet":   bet,
		}, "", "  ")
		fmt.Println(string(b))
	} else {
		for i, sr := range spinResults {
			line := fmt.Sprintf("%s %s %s", sr.Reels[0], sr.Reels[1], sr.Reels[2])
			if spins == 1 {
				fmt.Printf("🎰 %s\n", line)
				if sr.Win > 0 {
					fmt.Printf("  You won $%d!\n", sr.Win)
				} else {
					fmt.Printf("  No win. Try again.\n")
				}
				fmt.Printf("  Balance: $%d\n", sr.Balance)
			} else {
				result := "No win"
				if sr.Win > 0 {
					result = fmt.Sprintf("Win $%d", sr.Win)
				}
				fmt.Printf("  %2d. %s  (%s)\n", i+1, line, result)
			}
		}
	}
	return nil
}
