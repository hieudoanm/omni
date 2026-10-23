package match

import (
	"github.com/spf13/cobra"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/chess/chess.com/match/daily"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/chess/chess.com/match/daily-board"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/chess/chess.com/match/live"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/chess/chess.com/match/live-board"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "match",
		Short: "Chess.com team match data",
		Long:  `Fetch Chess.com team match data: daily and live matches and boards.`,
		RunE:  func(cmd *cobra.Command, args []string) error { return cmd.Help() },
	}
	cmd.AddCommand(daily.NewCmd())
	cmd.AddCommand(dailyboard.NewCmd())
	cmd.AddCommand(livematch.NewCmd())
	cmd.AddCommand(liveboard.NewCmd())
	return cmd
}
