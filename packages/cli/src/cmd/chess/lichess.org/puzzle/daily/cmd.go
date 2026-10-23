package daily

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "daily",
		Short: "Fetch the daily puzzle",
		RunE:  runDaily,
	}

	cmd.Flags().Bool("json", false, "Output as JSON")

	return cmd
}
