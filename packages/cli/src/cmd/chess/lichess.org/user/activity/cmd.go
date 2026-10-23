package activity

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "activity [username]",
		Short: "Fetch a user's recent activity",
		Args:  cobra.ExactArgs(1),
		RunE:  runActivity,
	}

	cmd.Flags().Bool("json", false, "Output as JSON")

	return cmd
}
