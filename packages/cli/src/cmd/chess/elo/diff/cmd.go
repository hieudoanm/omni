package diff

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "rating-diff",
		Short: "Convert between rating difference and expected score",
		Long: `Mode A (--difference): Convert rating difference to expected score.
Mode B (--expected-score): Convert expected score to rating difference.`,
		Example: `  chess elo rating-diff --difference 200
  chess elo rating-diff --expected-score 0.75`,
		RunE: runDiff,
	}

	cmd.Flags().Float64("difference", 0, "Rating difference (player - opponent)")
	cmd.Flags().Float64("expected-score", 0, "Expected score (decimal 0-1)")

	return cmd
}
