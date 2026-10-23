package player

import (
	"github.com/spf13/cobra"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/chess/chess.com/player/archive"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/chess/chess.com/player/archives"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/chess/chess.com/player/clubs"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/chess/chess.com/player/games"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/chess/chess.com/player/live"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/chess/chess.com/player/matches"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/chess/chess.com/player/online"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/chess/chess.com/player/pgn"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/chess/chess.com/player/profile"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/chess/chess.com/player/stats"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/chess/chess.com/player/to_move"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/chess/chess.com/player/tournaments"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "player",
		Short: "Chess.com player data",
		Long:  `Fetch Chess.com player data: profile, stats, games, clubs, matches, and tournaments.`,
		RunE:  func(cmd *cobra.Command, args []string) error { return cmd.Help() },
	}

	cmd.AddCommand(profile.NewCmd())
	cmd.AddCommand(stats.NewCmd())
	cmd.AddCommand(online.NewCmd())
	cmd.AddCommand(games.NewCmd())
	cmd.AddCommand(to_move.NewCmd())
	cmd.AddCommand(archives.NewCmd())
	cmd.AddCommand(archive.NewCmd())
	cmd.AddCommand(live.NewCmd())
	cmd.AddCommand(pgn.NewCmd())
	cmd.AddCommand(clubs.NewCmd())
	cmd.AddCommand(matches.NewCmd())
	cmd.AddCommand(tournaments.NewCmd())

	return cmd
}
