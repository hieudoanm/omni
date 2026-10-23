package tournament

import (
	"github.com/spf13/cobra"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/chess/chess.com/tournament/group"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/chess/chess.com/tournament/info"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/chess/chess.com/tournament/round"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "tournament",
		Short: "Chess.com tournament data",
		Long:  `Fetch Chess.com tournament data: info, rounds, and groups.`,
		RunE:  func(cmd *cobra.Command, args []string) error { return cmd.Help() },
	}
	cmd.AddCommand(info.NewCmd())
	cmd.AddCommand(round.NewCmd())
	cmd.AddCommand(group.NewCmd())
	return cmd
}
