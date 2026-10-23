package country

import (
	"github.com/spf13/cobra"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/chess/chess.com/country/clubs"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/chess/chess.com/country/players"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/chess/chess.com/country/profile"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "country",
		Short: "Chess.com country data",
		Long:  `Fetch Chess.com country data: profile, players, and clubs.`,
		RunE:  func(cmd *cobra.Command, args []string) error { return cmd.Help() },
	}
	cmd.AddCommand(profile.NewCmd())
	cmd.AddCommand(players.NewCmd())
	cmd.AddCommand(clubs.NewCmd())
	return cmd
}
