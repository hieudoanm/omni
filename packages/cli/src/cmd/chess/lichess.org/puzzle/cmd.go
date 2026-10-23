package puzzle

import (
	"github.com/hieudoanm/omni/packages/cli/src/cmd/chess/lichess.org/puzzle/by_id"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/chess/lichess.org/puzzle/daily"
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "puzzle",
		Short: "Puzzle of the day and puzzle lookup",
		RunE:  func(cmd *cobra.Command, args []string) error { return cmd.Help() },
	}
	cmd.AddCommand(daily.NewCmd())
	cmd.AddCommand(by_id.NewCmd())
	return cmd
}
