package tpr

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "tpr",
		Short: "Calculate tournament performance rating",
		Long: `Estimate your playing strength based on opponent ratings and results.

Uses the formula: TPR = Avg(R_opp) + 400 * log10(score / (games - score))`,
		Example: `  chess elo tpr --ratings "1800,1900,2000,2100" --score 3 --games 4`,
		RunE:    runTpr,
	}

	cmd.Flags().String("ratings", "", "Comma-separated opponent ratings (required)")
	cmd.Flags().Float64("score", 0, "Your total score (required)")
	cmd.Flags().Int("games", 0, "Total number of games (required)")
	cmd.MarkFlagRequired("ratings")
	cmd.MarkFlagRequired("score")
	cmd.MarkFlagRequired("games")

	return cmd
}
