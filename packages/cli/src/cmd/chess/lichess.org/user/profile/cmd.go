package profile

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "profile [username]",
		Short: "Fetch a user's public profile",
		Args:  cobra.ExactArgs(1),
		RunE:  runProfile,
	}

	cmd.Flags().Bool("json", false, "Output as JSON")

	return cmd
}
