package stats

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	var username string
	cmd := &cobra.Command{
		Use:   "stats",
		Short: "Show Chess.com player stats",
		Long:  `Fetch and display a Chess.com player's ratings and stats.`,
		Example: `  chess com player stats --username hikaru
  chess com player stats --username magnuscarlsen`,
		RunE: runPlayerStats,
	}
	cmd.Flags().StringVarP(&username, "username", "u", "", "Chess.com username")
	return cmd
}
