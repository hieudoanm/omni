package expected

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:     "expected-score",
		Short:   "Calculate expected score between two players",
		Example: `  chess elo expected-score --player-rating 1800 --opponent-rating 2000`,
		RunE:    runExpected,
	}

	cmd.Flags().Float64("player-rating", 0, "Your current rating (required)")
	cmd.Flags().Float64("opponent-rating", 0, "Opponent's rating (required)")
	cmd.MarkFlagRequired("player-rating")
	cmd.MarkFlagRequired("opponent-rating")

	return cmd
}
