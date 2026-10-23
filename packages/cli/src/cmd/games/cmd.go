package games

import (
	"github.com/hieudoanm/omni/packages/cli/src/cmd/games/anagram"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/games/reaction"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/games/recall"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/games/typerace"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/games/wordle"
	"github.com/spf13/cobra"
)

func NewCommand() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "games",
		Short: "Play games in the terminal",
		RunE:  func(cmd *cobra.Command, args []string) error { return cmd.Help() },
	}
	cmd.AddCommand(
		anagram.NewCommand(),
		reaction.NewCommand(),
		recall.NewCommand(),
		typerace.NewCommand(),
		wordle.NewCommand(),
	)
	return cmd
}
