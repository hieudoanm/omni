package perf

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "perf [username] [perf-type]",
		Short: "Fetch performance stats for a specific rating type",
		Args:  cobra.ExactArgs(2),
		Example: `  chess lichess user perf thibault blitz
  chess lichess user perf hikaru rapid`,
		RunE: runPerf,
	}

	cmd.Flags().Bool("json", false, "Output as JSON")

	return cmd
}
