package tpr

import (
	"encoding/json"
	"fmt"
	"math"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/chess/elo/internal"
	"github.com/spf13/cobra"
)

func runTpr(cmd *cobra.Command, args []string) error {
	jsonOut, _ := cmd.Flags().GetBool("json")
	ratingsRaw, _ := cmd.Flags().GetString("ratings")
	score, _ := cmd.Flags().GetFloat64("score")
	games, _ := cmd.Flags().GetInt("games")

	ratings := internal.ParseFloats(ratingsRaw)
	if len(ratings) == 0 {
		return fmt.Errorf("--ratings is required (comma-separated)")
	}

	if games > len(ratings) {
		games = len(ratings)
	}

	if score < 0 || score > float64(games) {
		return fmt.Errorf("score must be between 0 and %d", games)
	}

	avg, tpr := internal.PerformanceRating(ratings, score, games)

	if jsonOut {
		b, _ := json.MarshalIndent(map[string]interface{}{
			"opponent_ratings":    ratings,
			"score":               score,
			"games":               games,
			"avg_opponent_rating": avg,
			"tpr":                 math.Round(tpr),
		}, "", "  ")
		fmt.Println(string(b))
		return nil
	}

	fmt.Println()
	fmt.Println("♞ Tournament Performance Rating")
	fmt.Println("------------------------------------------------")
	fmt.Printf("Opponent Ratings  : %v\n", ratings)
	fmt.Printf("Score             : %.0f/%d\n", score, games)
	fmt.Printf("Avg Opponent      : %.0f\n", avg)
	fmt.Println("------------------------------------------------")
	fmt.Printf("TPR               : %.0f\n", math.Round(tpr))

	return nil
}
