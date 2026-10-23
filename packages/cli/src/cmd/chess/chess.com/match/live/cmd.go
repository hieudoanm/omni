package livematch

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	var id string
	cmd := &cobra.Command{
		Use:     "live",
		Short:   "Show live team match",
		Long:    `Fetch and display a live team match's details.`,
		Example: `  chess com match live --id 5833`,
		RunE:    runLiveMatch,
	}
	cmd.Flags().StringVar(&id, "id", "", "Match ID")
	return cmd
}
