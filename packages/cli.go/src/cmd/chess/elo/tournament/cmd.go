package tournament

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:     "tournament",
		Short:   "Calculate total rating change across multiple games",
		Example: `  chess elo tournament --starting-rating 1800 --k-factor 20 --opponents "1900,1750,1850" --results "win,draw,loss"`,
		RunE:    runTournament,
	}

	cmd.Flags().Float64("starting-rating", 0, "Starting rating before the tournament (required)")
	cmd.Flags().Float64("k-factor", 20, "K-factor (default 20)")
	cmd.Flags().String("opponents", "", "Comma-separated opponent ratings (required)")
	cmd.Flags().String("results", "", "Comma-separated results: win/draw/loss (required)")
	cmd.MarkFlagRequired("starting-rating")
	cmd.MarkFlagRequired("opponents")
	cmd.MarkFlagRequired("results")

	return cmd
}
