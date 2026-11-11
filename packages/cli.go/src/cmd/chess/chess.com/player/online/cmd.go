package online

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	var username string
	cmd := &cobra.Command{
		Use:   "online",
		Short: "Check if a player is online",
		Long:  `Check if a Chess.com player has been online in the last 5 minutes.`,
		Example: `  chess com player online --username hikaru
  chess com player online --username magnuscarlsen`,
		RunE: runOnline,
	}
	cmd.Flags().StringVarP(&username, "username", "u", "", "Chess.com username")
	return cmd
}
