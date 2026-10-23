package profile

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	var username string
	cmd := &cobra.Command{
		Use:   "profile",
		Short: "Show Chess.com player profile",
		Long:  `Fetch and display a Chess.com player's profile information.`,
		Example: `  chess com player profile --username hikaru
  chess com player profile --username magnuscarlsen`,
		RunE: runPlayerProfile,
	}
	cmd.Flags().StringVarP(&username, "username", "u", "", "Chess.com username")
	return cmd
}
