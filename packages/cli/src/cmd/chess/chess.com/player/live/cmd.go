package live

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	var username string
	var base, inc int
	cmd := &cobra.Command{
		Use:   "live",
		Short: "Show live game archive by time control",
		Long:  `Fetch and display live chess games filtered by base time and increment.`,
		Example: `  chess com player live --username hikaru --base 180 --increment 2
  chess com player live --username magnuscarlsen --base 60 --increment 0`,
		RunE: runLiveGames,
	}
	cmd.Flags().StringVarP(&username, "username", "u", "", "Chess.com username")
	cmd.Flags().IntVarP(&base, "base", "b", 0, "Base time in seconds")
	cmd.Flags().IntVarP(&inc, "increment", "i", 0, "Increment in seconds")
	return cmd
}
