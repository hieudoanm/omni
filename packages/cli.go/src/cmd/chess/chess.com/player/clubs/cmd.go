package clubs

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	var username string
	cmd := &cobra.Command{
		Use:   "clubs",
		Short: "Show player's clubs",
		Long:  `List the clubs a player is a member of.`,
		Example: `  chess com player clubs --username hikaru
  chess com player clubs --username magnuscarlsen`,
		RunE: runPlayerClubs,
	}
	cmd.Flags().StringVarP(&username, "username", "u", "", "Chess.com username")
	return cmd
}
