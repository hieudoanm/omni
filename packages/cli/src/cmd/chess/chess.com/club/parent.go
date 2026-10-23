package club

import (
	"github.com/spf13/cobra"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/chess/chess.com/club/matches"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/chess/chess.com/club/members"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/chess/chess.com/club/profile"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "club",
		Short: "Chess.com club data",
		Long:  `Fetch Chess.com club data: profile, members, and matches.`,
		RunE:  func(cmd *cobra.Command, args []string) error { return cmd.Help() },
	}
	cmd.AddCommand(profile.NewCmd())
	cmd.AddCommand(members.NewCmd())
	cmd.AddCommand(matches.NewCmd())
	return cmd
}
