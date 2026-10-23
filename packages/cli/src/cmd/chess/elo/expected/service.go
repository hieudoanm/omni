package expected

import (
	"encoding/json"
	"fmt"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/chess/elo/internal"
	"github.com/spf13/cobra"
)

func runExpected(cmd *cobra.Command, args []string) error {
	jsonOut, _ := cmd.Flags().GetBool("json")
	player, _ := cmd.Flags().GetFloat64("player-rating")
	opponent, _ := cmd.Flags().GetFloat64("opponent-rating")

	expected := internal.ExpectedScore(player, opponent)

	if jsonOut {
		b, _ := json.MarshalIndent(map[string]interface{}{
			"player_rating":   player,
			"opponent_rating": opponent,
			"expected_score":  expected,
			"expected_pct":    expected * 100,
		}, "", "  ")
		fmt.Println(string(b))
		return nil
	}

	fmt.Println()
	fmt.Println("♞ Expected Score")
	fmt.Println("------------------------------------------------")
	fmt.Printf("Player Rating   : %.0f\n", player)
	fmt.Printf("Opponent Rating : %.0f\n", opponent)
	fmt.Println("------------------------------------------------")
	fmt.Printf("Expected Score  : %.3f\n", expected)
	fmt.Printf("Expected %%      : %.1f%%\n", expected*100)

	return nil
}
