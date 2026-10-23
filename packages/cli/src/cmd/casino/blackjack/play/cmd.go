package play

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	return &cobra.Command{
		Use:     "play",
		Short:   "Play a full game of Blackjack against the dealer",
		Long:    `Play a full game of Blackjack against the dealer with a Bubble Tea TUI. Supports hit, stand, and double down. Starts with $1000 balance.`,
		Example: `  casino blackjack play`,
		RunE: func(cmd *cobra.Command, args []string) error {
			return runPlay()
		},
	}
}
