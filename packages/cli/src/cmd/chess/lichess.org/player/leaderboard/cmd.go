package leaderboard

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "leaderboard [perf-type] [count]",
		Short: "Top N players for a specific rating type",
		Args:  cobra.RangeArgs(1, 2),
		Example: `  chess lichess player leaderboard bullet 20
  chess lichess player leaderboard blitz`,
		RunE: runLeaderboard,
	}

	cmd.Flags().Bool("json", false, "Output as JSON")

	return cmd
}
