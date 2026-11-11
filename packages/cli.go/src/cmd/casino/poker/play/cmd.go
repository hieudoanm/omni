package play

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	return &cobra.Command{
		Use:     "play",
		Short:   "Play heads-up Texas Hold'em against an AI opponent",
		Long:    `Play heads-up Texas Hold'em against an AI opponent with a Bubble Tea TUI. Supports check, bet, call, raise, and fold. Starts with $1000 each.`,
		Example: `  casino poker play`,
		RunE: func(cmd *cobra.Command, args []string) error {
			return runPlay()
		},
	}
}
