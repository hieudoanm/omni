package matches

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	var username string
	cmd := &cobra.Command{
		Use:   "matches",
		Short: "Show player's team matches",
		Long:  `List team matches a player has participated in.`,
		Example: `  chess com player matches --username hikaru
  chess com player matches --username magnuscarlsen`,
		RunE: runPlayerMatches,
	}
	cmd.Flags().StringVarP(&username, "username", "u", "", "Chess.com username")
	return cmd
}
