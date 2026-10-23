package by_id

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "by-id [puzzle-id]",
		Short: "Fetch a puzzle by ID",
		Args:  cobra.ExactArgs(1),
		RunE:  runByID,
	}

	cmd.Flags().Bool("json", false, "Output as JSON")

	return cmd
}
