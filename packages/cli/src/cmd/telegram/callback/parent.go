package callback

import (
	"github.com/hieudoanm/omni/packages/cli/src/cmd/telegram/callback/answer"
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "callback",
		Short: "Answer callback queries",
		RunE:  func(cmd *cobra.Command, args []string) error { return cmd.Help() },
	}
	cmd.AddCommand(answer.NewCmd())
	return cmd
}
