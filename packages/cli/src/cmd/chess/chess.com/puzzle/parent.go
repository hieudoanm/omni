package puzzle

import (
	"github.com/spf13/cobra"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/chess/chess.com/puzzle/daily"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/chess/chess.com/puzzle/random"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "puzzle",
		Short: "Chess.com daily puzzle",
		Long:  `Fetch the daily puzzle or a random puzzle from Chess.com.`,
		RunE:  func(cmd *cobra.Command, args []string) error { return cmd.Help() },
	}
	cmd.AddCommand(daily.NewCmd())
	cmd.AddCommand(randompuzzle.NewCmd())
	return cmd
}
