package archive

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	var username, year, month string
	cmd := &cobra.Command{
		Use:   "archive",
		Short: "Show monthly game archive",
		Long:  `Fetch and display a monthly archive of completed games.`,
		Example: `  chess com player archive --username hikaru --year 2024 --month 01
  chess com player archive --username magnuscarlsen --year 2023 --month 12`,
		RunE: runArchive,
	}
	cmd.Flags().StringVarP(&username, "username", "u", "", "Chess.com username")
	cmd.Flags().StringVarP(&year, "year", "y", "", "Year (YYYY)")
	cmd.Flags().StringVarP(&month, "month", "m", "", "Month (MM)")
	return cmd
}
