package poker

import (
	"github.com/spf13/cobra"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/casino/poker/odds"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/casino/poker/play"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "poker",
		Short: "Poker: odds calculator and Texas Hold'em",
		Long:  `Poker subcommands: calculate Texas Hold'em odds, or play heads-up against an AI.`,
		Example: `  casino poker odds --hand "Ah Kh"
  casino poker play`,
		RunE: func(cmd *cobra.Command, args []string) error { return cmd.Help() },
	}
	cmd.AddCommand(
		odds.NewCmd(),
		play.NewCmd(),
	)
	return cmd
}
