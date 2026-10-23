package game

import (
	"github.com/hieudoanm/omni/packages/cli/src/cmd/telegram/game/high_scores"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/telegram/game/send"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/telegram/game/set_score"
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "game",
		Short: "Send and manage games",
		RunE:  func(cmd *cobra.Command, args []string) error { return cmd.Help() },
	}
	cmd.AddCommand(high_scores.NewCmd())
	cmd.AddCommand(send.NewCmd())
	cmd.AddCommand(set_score.NewCmd())
	return cmd
}
