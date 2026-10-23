package play

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	return &cobra.Command{
		Use:     "play",
		Short:   "Play a game of Baccarat",
		Long:    `Play a game of Baccarat against the banker with a Bubble Tea TUI. Bet on Player, Banker, or Tie. Follows standard baccarat drawing rules.`,
		Example: `  casino baccarat play`,
		RunE: func(cmd *cobra.Command, args []string) error {
			return runPlay()
		},
	}
}
