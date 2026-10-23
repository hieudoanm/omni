package results

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "results [tournament-id]",
		Short: "Fetch tournament results",
		Args:  cobra.ExactArgs(1),
		RunE:  runResults,
	}

	cmd.Flags().Int("top", 0, "Number of top results to fetch")
	cmd.Flags().Bool("json", false, "Output as JSON")

	return cmd
}
