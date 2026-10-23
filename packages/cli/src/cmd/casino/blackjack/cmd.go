package blackjack

import (
	"github.com/spf13/cobra"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/casino/blackjack/cheatsheet"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/casino/blackjack/count"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/casino/blackjack/play"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "blackjack",
		Short: "Blackjack games",
		Long:  `Blackjack subcommands: play a full game, or practice card counting.`,
		Example: `  casino blackjack play
  casino blackjack count`,
		RunE: func(cmd *cobra.Command, args []string) error { return cmd.Help() },
	}
	cmd.AddCommand(
		cheatsheet.NewCmd(),
		count.NewCmd(),
		play.NewCmd(),
	)
	return cmd
}
