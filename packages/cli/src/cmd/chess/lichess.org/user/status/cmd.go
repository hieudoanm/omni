package status

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "status [usernames...]",
		Short: "Check if users are online/playing",
		Args:  cobra.MinimumNArgs(1),
		RunE:  runStatus,
	}

	cmd.Flags().Bool("json", false, "Output as JSON")

	return cmd
}
