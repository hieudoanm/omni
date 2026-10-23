package required

import (
	"encoding/json"
	"fmt"
	"math"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/chess/elo/internal"
	"github.com/spf13/cobra"
)

func runRequired(cmd *cobra.Command, args []string) error {
	jsonOut, _ := cmd.Flags().GetBool("json")
	avg, _ := cmd.Flags().GetFloat64("avg-opponent-rating")
	games, _ := cmd.Flags().GetFloat64("games")
	target, _ := cmd.Flags().GetFloat64("target-tpr")

	if games <= 0 {
		return fmt.Errorf("--games must be positive")
	}

	requiredScore, requiredPct := internal.RequiredScore(avg, games, target)

	if jsonOut {
		b, _ := json.MarshalIndent(map[string]interface{}{
			"avg_opponent_rating": avg,
			"games":               games,
			"target_tpr":          target,
			"required_score":      math.Round(requiredScore*10) / 10,
			"required_pct":        math.Round(requiredPct*10) / 10,
		}, "", "  ")
		fmt.Println(string(b))
		return nil
	}

	fmt.Println()
	fmt.Println("♞ Required Score")
	fmt.Println("------------------------------------------------")
	fmt.Printf("Avg Opponent Rating : %.0f\n", avg)
	fmt.Printf("Games               : %.0f\n", games)
	fmt.Printf("Target TPR          : %.0f\n", target)
	fmt.Println("------------------------------------------------")
	fmt.Printf("Required Score      : %.1f\n", math.Round(requiredScore*10)/10)
	fmt.Printf("Required %%          : %.1f%%\n", math.Round(requiredPct*10)/10)

	return nil
}
