package reaction

import (
	"github.com/spf13/cobra"
)

const rounds = 5

func NewCommand() *cobra.Command {
	return &cobra.Command{
		Use:   "reaction",
		Short: "Test your reaction time",
		Long:  `Press Enter when you see the cue. Your reaction time is measured in milliseconds over 5 rounds.`,
		RunE: func(cmd *cobra.Command, args []string) error {
			return runReaction()
		},
	}
}
