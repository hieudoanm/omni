package leaderboards

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "leaderboards",
		Short: "Show Chess.com leaderboards",
		Long:  `Fetch and display top players from Chess.com leaderboards for bullet, blitz, rapid, and Chess960 variants. Supports filtering by country.`,
		Example: `  chess com leaderboards
  chess com leaderboards --top 10
  chess com leaderboards --country US`,
		RunE: runLeaderboards,
	}
	cmd.Flags().Int("top", 5, "Number of top players to display")
	cmd.Flags().String("country", "", "Filter players by country code (e.g., US, RU)")
	return cmd
}
