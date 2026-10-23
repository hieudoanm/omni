package daily

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	var id string
	cmd := &cobra.Command{
		Use:     "daily",
		Short:   "Show daily team match",
		Long:    `Fetch and display a daily team match's details.`,
		Example: `  chess com match daily --id 12803`,
		RunE:    runDailyMatch,
	}
	cmd.Flags().StringVar(&id, "id", "", "Match ID")
	return cmd
}
