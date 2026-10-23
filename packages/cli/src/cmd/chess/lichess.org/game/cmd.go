package game

import (
	"github.com/hieudoanm/omni/packages/cli/src/cmd/chess/lichess.org/game/export"
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "game",
		Short: "Game export and analysis",
		RunE:  func(cmd *cobra.Command, args []string) error { return cmd.Help() },
	}
	cmd.AddCommand(export.NewCmd())
	return cmd
}
