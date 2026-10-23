package change

import (
	"encoding/json"
	"fmt"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/chess/elo/internal"
	"github.com/spf13/cobra"
)

func runChange(cmd *cobra.Command, args []string) error {
	jsonOut, _ := cmd.Flags().GetBool("json")
	player, _ := cmd.Flags().GetFloat64("player-rating")
	opponent, _ := cmd.Flags().GetFloat64("opponent-rating")
	result, _ := cmd.Flags().GetString("result")
	k, _ := cmd.Flags().GetFloat64("k-factor")

	score, err := internal.ResultToScore(result)
	if err != nil {
		return fmt.Errorf("invalid result %q; use win/draw/loss", result)
	}

	delta, newRating := internal.RatingChange(player, opponent, score, k)

	if jsonOut {
		b, _ := json.MarshalIndent(map[string]interface{}{
			"player_rating":   player,
			"opponent_rating": opponent,
			"result":          result,
			"k_factor":        k,
			"expected_score":  internal.ExpectedScore(player, opponent),
			"rating_change":   delta,
			"new_rating":      newRating,
		}, "", "  ")
		fmt.Println(string(b))
		return nil
	}

	sign := "+"
	if delta < 0 {
		sign = ""
	}
	fmt.Println()
	fmt.Println("♞ Rating Change")
	fmt.Println("------------------------------------------------")
	fmt.Printf("Player Rating   : %.0f\n", player)
	fmt.Printf("Opponent Rating : %.0f\n", opponent)
	fmt.Printf("Result          : %s\n", result)
	fmt.Printf("K-Factor        : %.0f\n", k)
	exp := internal.ExpectedScore(player, opponent)
	fmt.Printf("Expected Score  : %.3f\n", exp)
	fmt.Println("------------------------------------------------")
	fmt.Printf("Rating Change   : %s%.1f\n", sign, delta)
	fmt.Printf("New Rating      : %.0f\n", newRating)

	return nil
}
