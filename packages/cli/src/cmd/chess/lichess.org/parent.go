package lichess

import (
	"github.com/hieudoanm/omni/packages/cli/src/cmd/chess/lichess.org/crosstable"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/chess/lichess.org/game"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/chess/lichess.org/opening"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/chess/lichess.org/player"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/chess/lichess.org/puzzle"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/chess/lichess.org/streamer"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/chess/lichess.org/study"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/chess/lichess.org/tablebase"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/chess/lichess.org/team"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/chess/lichess.org/tournament"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/chess/lichess.org/tv"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/chess/lichess.org/user"
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "lichess",
		Short: "Lichess.org tools and API client",
		Long:  `Query the Lichess API for users, puzzles, games, tournaments, teams, and more.`,
		Example: `  chess lichess user profile --username thibault
  chess lichess puzzle daily
  chess lichess player top10
  chess lichess tv channels`,
		RunE: func(cmd *cobra.Command, args []string) error { return cmd.Help() },
	}

	cmd.AddCommand(user.NewCmd())
	cmd.AddCommand(puzzle.NewCmd())
	cmd.AddCommand(game.NewCmd())
	cmd.AddCommand(player.NewCmd())
	cmd.AddCommand(tv.NewCmd())
	cmd.AddCommand(streamer.NewCmd())
	cmd.AddCommand(crosstable.NewCmd())
	cmd.AddCommand(tournament.NewCmd())
	cmd.AddCommand(team.NewCmd())
	cmd.AddCommand(study.NewCmd())
	cmd.AddCommand(tablebase.NewCmd())
	cmd.AddCommand(opening.NewCmd())

	return cmd
}
