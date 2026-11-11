package rating

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "rating-history [username]",
		Short: "Fetch a user's rating history",
		Args:  cobra.ExactArgs(1),
		RunE:  runRating,
	}

	cmd.Flags().Bool("json", false, "Output as JSON")

	return cmd
}
