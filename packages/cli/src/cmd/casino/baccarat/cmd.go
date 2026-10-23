package baccarat

import (
	"github.com/spf13/cobra"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/casino/baccarat/play"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/casino/baccarat/strategy"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "baccarat",
		Short: "Baccarat games",
		Long:  `Baccarat subcommands: play a game, or analyze betting strategy.`,
		Example: `  casino baccarat play
  casino baccarat strategy`,
		RunE: func(cmd *cobra.Command, args []string) error { return cmd.Help() },
	}
	cmd.AddCommand(
		play.NewCmd(),
		strategy.NewCmd(),
	)
	return cmd
}
