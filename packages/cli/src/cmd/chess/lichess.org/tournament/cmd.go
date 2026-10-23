package tournament

import (
	"github.com/hieudoanm/omni/packages/cli/src/cmd/chess/lichess.org/tournament/info"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/chess/lichess.org/tournament/results"
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "tournament",
		Short: "Tournament information and results",
		RunE:  func(cmd *cobra.Command, args []string) error { return cmd.Help() },
	}
	cmd.AddCommand(info.NewCmd())
	cmd.AddCommand(results.NewCmd())
	return cmd
}
