package crosstable

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "crosstable [user1] [user2]",
		Short: "Head-to-head statistics between two users",
		Args:  cobra.ExactArgs(2),
		RunE:  runCrosstable,
	}

	cmd.Flags().Bool("json", false, "Output as JSON")

	return cmd
}
