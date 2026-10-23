package change

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:     "rating-change",
		Short:   "Calculate rating change after a game",
		Example: `  chess elo rating-change --player-rating 1800 --opponent-rating 2000 --result win --k-factor 20`,
		RunE:    runChange,
	}

	cmd.Flags().Float64("player-rating", 0, "Your current rating (required)")
	cmd.Flags().Float64("opponent-rating", 0, "Opponent's rating (required)")
	cmd.Flags().String("result", "", "Game result: win/draw/loss (required)")
	cmd.Flags().Float64("k-factor", 20, "K-factor (default 20)")
	cmd.MarkFlagRequired("player-rating")
	cmd.MarkFlagRequired("opponent-rating")
	cmd.MarkFlagRequired("result")

	return cmd
}
