package tournaments

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	var username string
	cmd := &cobra.Command{
		Use:   "tournaments",
		Short: "Show player's tournaments",
		Long:  `List tournaments a player has participated in.`,
		Example: `  chess com player tournaments --username hikaru
  chess com player tournaments --username magnuscarlsen`,
		RunE: runPlayerTournaments,
	}
	cmd.Flags().StringVarP(&username, "username", "u", "", "Chess.com username")
	return cmd
}
