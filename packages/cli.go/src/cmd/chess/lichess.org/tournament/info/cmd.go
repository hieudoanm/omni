package info

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "info [tournament-id]",
		Short: "Fetch tournament details",
		Args:  cobra.ExactArgs(1),
		RunE:  runInfo,
	}

	cmd.Flags().Bool("json", false, "Output as JSON")

	return cmd
}
