package required

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "required-score",
		Short: "Calculate score needed for a target performance rating",
		Long: `Determine what score you need against a given average opponent rating to reach a target TPR.

Uses: TPR = Avg(R_opp) + 400 * log10(S / (N - S)), solved for S.`,
		Example: `  chess elo required-score --avg-opponent-rating 2200 --games 9 --target-tpr 2400`,
		RunE:    runRequired,
	}

	cmd.Flags().Float64("avg-opponent-rating", 0, "Average opponent rating (required)")
	cmd.Flags().Float64("games", 0, "Number of games (required)")
	cmd.Flags().Float64("target-tpr", 0, "Target tournament performance rating (required)")
	cmd.MarkFlagRequired("avg-opponent-rating")
	cmd.MarkFlagRequired("games")
	cmd.MarkFlagRequired("target-tpr")

	return cmd
}
