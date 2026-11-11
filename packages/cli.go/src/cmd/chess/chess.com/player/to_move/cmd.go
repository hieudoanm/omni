package to_move

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	var username string
	cmd := &cobra.Command{
		Use:   "to-move",
		Short: "Show games where it's the player's turn",
		Long:  `Fetch and display daily chess games where the player needs to make a move.`,
		Example: `  chess com player to-move --username hikaru
  chess com player to-move --username magnuscarlsen`,
		RunE: runToMove,
	}
	cmd.Flags().StringVarP(&username, "username", "u", "", "Chess.com username")
	return cmd
}
