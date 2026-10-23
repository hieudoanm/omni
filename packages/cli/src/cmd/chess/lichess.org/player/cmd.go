package player

import (
	"github.com/hieudoanm/omni/packages/cli/src/cmd/chess/lichess.org/player/leaderboard"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/chess/lichess.org/player/top10"
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "player",
		Short: "Top players and leaderboards",
		RunE:  func(cmd *cobra.Command, args []string) error { return cmd.Help() },
	}
	cmd.AddCommand(top10.NewCmd())
	cmd.AddCommand(leaderboard.NewCmd())
	return cmd
}
