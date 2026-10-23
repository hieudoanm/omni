package chesscom

import (
	"github.com/spf13/cobra"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/chess/chess.com/club"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/chess/chess.com/country"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/chess/chess.com/leaderboards"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/chess/chess.com/match"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/chess/chess.com/player"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/chess/chess.com/puzzle"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/chess/chess.com/streamer"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/chess/chess.com/titled"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/chess/chess.com/tournament"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "com",
		Short: "Chess.com integration",
		Long:  `Fetch data from Chess.com: player profiles, leaderboards, titled player counts, clubs, countries, puzzles, streamers, tournaments, and matches.`,
		Example: `  chess com player --username hikaru
  chess com leaderboards --top 10
  chess com titled`,
		RunE: func(cmd *cobra.Command, args []string) error { return cmd.Help() },
	}

	cmd.AddCommand(player.NewCmd())
	cmd.AddCommand(leaderboards.NewCmd())
	cmd.AddCommand(titled.NewCmd())
	cmd.AddCommand(club.NewCmd())
	cmd.AddCommand(country.NewCmd())
	cmd.AddCommand(puzzle.NewCmd())
	cmd.AddCommand(streamer.NewCmd())
	cmd.AddCommand(tournament.NewCmd())
	cmd.AddCommand(match.NewCmd())

	return cmd
}
