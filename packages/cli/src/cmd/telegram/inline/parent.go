package inline

import (
	"github.com/hieudoanm/omni/packages/cli/src/cmd/telegram/inline/answer"
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "inline",
		Short: "Answer inline queries",
		RunE:  func(cmd *cobra.Command, args []string) error { return cmd.Help() },
	}
	cmd.AddCommand(answer.NewCmd())
	return cmd
}
