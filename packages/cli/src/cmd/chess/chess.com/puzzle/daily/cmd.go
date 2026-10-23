package daily

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	return &cobra.Command{
		Use:     "daily",
		Short:   "Show daily puzzle",
		Long:    `Fetch and display the daily puzzle from Chess.com.`,
		Example: `  chess com puzzle daily`,
		RunE:    runDailyPuzzle,
	}
}
