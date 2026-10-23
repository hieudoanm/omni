package archives

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	var username string
	cmd := &cobra.Command{
		Use:   "archives",
		Short: "List monthly game archives",
		Long:  `List available monthly archives for a player's completed games.`,
		Example: `  chess com player archives --username hikaru
  chess com player archives --username magnuscarlsen`,
		RunE: runArchives,
	}
	cmd.Flags().StringVarP(&username, "username", "u", "", "Chess.com username")
	return cmd
}
