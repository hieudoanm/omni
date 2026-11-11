package games

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	var username string
	cmd := &cobra.Command{
		Use:   "games",
		Short: "Show current daily chess games",
		Long:  `Fetch and display a player's current daily chess games.`,
		Example: `  chess com player games --username hikaru
  chess com player games --username magnuscarlsen`,
		RunE: runPlayerGames,
	}
	cmd.Flags().StringVarP(&username, "username", "u", "", "Chess.com username")
	return cmd
}
